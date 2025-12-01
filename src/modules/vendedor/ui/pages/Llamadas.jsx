import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../infra/supabase/supabaseClient";
import { ClientesSupabaseRepository } from "../../../vendedor/infra/supabase/ClientesSupabaseRepository.js";
import { createGetMisClientes } from "../../../vendedor/application/use-cases/getMisClientes.js";

const clientesRepository = new ClientesSupabaseRepository(supabase);
const getMisClientes = createGetMisClientes({ clientesRepository });

const nowISO = () => new Date().toISOString();
const fmtFechaHora = (iso) => {
  if (!iso) return { fecha: "-", hora: "-" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { fecha: "-", hora: "-" };
  const fecha = d.toLocaleDateString("es-GT");
  const hora = d.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
  return { fecha, hora };
};

export default function Llamadas() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSel, setClienteSel] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [canal, setCanal] = useState("WhatsApp");
  const [tipoCom, setTipoCom] = useState("Entrante");
  const [gestion, setGestion] = useState("Contacto");
  const [seguimiento, setSeguimiento] = useState("");
  const [comentario, setComentario] = useState("");
  const [ahora, setAhora] = useState(nowISO());

  useEffect(() => {
    (async () => {
      try {
        setCargandoClientes(true);
        const data = await getMisClientes();
        setClientes(data);
        if (data.length > 0) setClienteSel(data[0]);
      } catch (e) {
        console.error("Error cargando clientes", e);
        setErrorMsg("No se pudieron cargar los clientes.");
      } finally {
        setCargandoClientes(false);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAhora(nowISO()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!clienteSel?.id) {
        setHistorial([]);
        return;
      }
      try {
        setCargandoHistorial(true);
        const { data, error } = await supabase
          .from("llamadas")
          .select("id, fecha_hora, tipo_gestion, proxima_fecha_contacto, canal, tipo_comunicacion, comentario")
          .eq("cliente_id", clienteSel.id)
          .order("fecha_hora", { ascending: false });
        if (error) throw error;
        setHistorial(data || []);
      } catch (e) {
        console.error("Error cargando historial de llamadas", e);
        setHistorial([]);
        setErrorMsg("No se pudo cargar el historial de llamadas.");
      } finally {
        setCargandoHistorial(false);
      }
    };
    fetchHistorial();
  }, [clienteSel]);

  const handleAgregar = async () => {
    if (!clienteSel?.id) return;
    if (!comentario.trim()) {
      setErrorMsg("Agrega un comentario.");
      return;
    }
    try {
      setErrorMsg("");
      const payload = {
        cliente_id: clienteSel.id,
        fecha_hora: nowISO(),
        tipo_gestion: gestion,
        proxima_fecha_contacto: seguimiento || null,
        canal,
        tipo_comunicacion: tipoCom,
        comentario: comentario.trim(),
      };
      const { error } = await supabase.from("llamadas").insert(payload);
      if (error) throw error;
      setComentario("");
      setSeguimiento("");
      setMostrarForm(false);
      const { data, error: errFetch } = await supabase
        .from("llamadas")
        .select("id, fecha_hora, tipo_gestion, proxima_fecha_contacto, canal, tipo_comunicacion, comentario")
        .eq("cliente_id", clienteSel.id)
        .order("fecha_hora", { ascending: false });
      if (errFetch) throw errFetch;
      setHistorial(data || []);
    } catch (e) {
      console.error("Error agregando llamada", e);
      setErrorMsg("No se pudo guardar el contacto.");
    }
  };

  const clientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return clientes;
    const q = busqueda.toLowerCase();
    return clientes.filter((c) => (c.nombre_completo || "").toLowerCase().includes(q));
  }, [busqueda, clientes]);

  const fechaHoraLabel = fmtFechaHora(ahora);

  return (
    <div className="h-full w-full p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-4 h-full">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#132338]/90 to-[#0f192b]/90 backdrop-blur-md shadow-[0_10px_30px_-14px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 text-white font-semibold">Clientes</div>
          <div className="px-4 py-3">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={cargandoClientes ? "Cargando..." : "Buscar cliente"}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
          </div>
          <div className="flex-1 overflow-y-auto text-white/80 divide-y divide-white/10">
            {cargandoClientes ? (
              <div className="p-4 text-sm text-white/70">Cargando clientes...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="p-4 text-sm text-white/70">Sin clientes.</div>
            ) : (
              clientesFiltrados.map((c) => {
                const activo = clienteSel?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setClienteSel(c);
                      setMostrarForm(false);
                      setComentario("");
                      setSeguimiento("");
                      setErrorMsg("");
                      setHistorial([]);
                    }}
                    className={`w-full text-left px-4 py-3 transition ${
                      activo
                        ? "bg-white/15 text-white shadow-inner shadow-cyan-500/20 border-l-2 border-cyan-400/60"
                        : "hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold">{c.nombre_completo || "Sin nombre"}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#132338]/90 to-[#0f192b]/90 backdrop-blur-md shadow-[0_10px_30px_-14px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/10 text-white font-semibold flex items-center justify-between">
            <span className="flex-1 text-center">Historial de llamadas</span>
            <button
              onClick={() => setMostrarForm((v) => !v)}
              className="h-10 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:brightness-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!clienteSel}
            >
              {mostrarForm ? "Cerrar" : "Nuevo contacto"}
            </button>
          </div>
          {mostrarForm && (
            <div className="px-5 py-4 space-y-4 bg-[#0f1c2f]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-sm text-white/80 mb-1">Fecha y hora</label>
                  <input
                    value={`${fechaHoraLabel.fecha} ${fechaHoraLabel.hora}`}
                    readOnly
                    disabled
                    className="h-11 rounded-lg border border-white/15 px-3 bg-[#173052] text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-white/80 mb-1">Canal</label>
                  <select
                    value={canal}
                    onChange={(e) => setCanal(e.target.value)}
                    className="h-11 rounded-lg border border-white/15 px-3 bg-[#173052] text-white"
                  >
                    <option>Facebook</option>
                    <option>WhatsApp</option>
                    <option>Llamada</option>
                    <option>Correo</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-white/80 mb-1">Tipo de comunicación</label>
                  <select
                    value={tipoCom}
                    onChange={(e) => setTipoCom(e.target.value)}
                    className="h-11 rounded-lg border border-white/15 px-3 bg-[#173052] text-white"
                  >
                    <option>Entrante</option>
                    <option>Saliente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-sm text-white/80 mb-1">Tipo de gestión</label>
                  <select
                    value={gestion}
                    onChange={(e) => setGestion(e.target.value)}
                    className="h-11 rounded-lg border border-white/15 px-3 bg-[#173052] text-white"
                  >
                    <option>Contacto</option>
                    <option>Seguimiento</option>
                    <option>Cotización</option>
                    <option>Cita</option>
                    <option>Visita Tecnica</option>
                    <option>Cierre</option>
                    <option>No contesta</option>
                    <option>Proceso de Instalación</option>
                    <option>Venta</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-white/80 mb-1">Próxima fecha de contacto</label>
                  <input
                    type="date"
                    value={seguimiento}
                    onChange={(e) => setSeguimiento(e.target.value)}
                    className="h-11 rounded-lg border border-white/15 px-3 bg-[#173052] text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-white/80 mb-1">Comentario</label>
                  <textarea
                    rows={1}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="rounded-lg border border-white/15 px-3 py-2 h-24 bg-[#173052] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setMostrarForm(false);
                    setComentario("");
                    setSeguimiento("");
                  }}
                  className="h-10 px-4 rounded-lg border border-white/25 text-white hover:bg-white/10"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleAgregar}
                  className="h-10 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold hover:brightness-110 shadow-sm"
                >
                  Agregar registro
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto bg-white/5">
            <div className="min-w-full overflow-x-auto">
              <table className="w-full text-sm text-white">
                <thead className="bg-white/10 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Hora</th>
                    <th className="px-3 py-2 text-left">Gestión</th>
                    <th className="px-3 py-2 text-left">Seguimiento</th>
                    <th className="px-3 py-2 text-left">Canal</th>
                    <th className="px-3 py-2 text-left">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoHistorial ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-white/60">
                        Cargando historial...
                      </td>
                    </tr>
                  ) : historial.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-white/60">
                        Sin registros.
                      </td>
                    </tr>
                  ) : (
                    historial.map((h) => {
                      const fh = fmtFechaHora(h.fecha_hora);
                      return (
                        <tr key={h.id} className="bg-white/5">
                          <td className="px-3 py-2">{fh.fecha}</td>
                          <td className="px-3 py-2">{fh.hora}</td>
                          <td className="px-3 py-2">{h.tipo_gestion || "-"}</td>
                          <td className="px-3 py-2">{h.proxima_fecha_contacto || "-"}</td>
                          <td className="px-3 py-2">
                            {h.canal || "-"}
                            {h.tipo_comunicacion ? ` (${h.tipo_comunicacion})` : ""}
                          </td>
                          <td className="px-3 py-2">{h.comentario || "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {errorMsg && (
              <div className="px-4 py-3 text-xs text-amber-200 bg-amber-500/10 border-t border-amber-500/30">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
