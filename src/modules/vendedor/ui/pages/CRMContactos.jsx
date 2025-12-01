import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../infra/supabase/supabaseClient";
import { ClientesSupabaseRepository } from "../../../vendedor/infra/supabase/ClientesSupabaseRepository.js";
import { createGetMisClientes } from "../../../vendedor/application/use-cases/getMisClientes.js";

const clientesRepository = new ClientesSupabaseRepository(supabase);
const getMisClientes = createGetMisClientes({ clientesRepository });
const STORAGE_KEY = "crm-contactos-vendedor";

const formatFecha = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const formatHora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const initialForm = {
  canal: "WhatsApp",
  tipoCom: "Entrante",
  gestion: "Contacto",
  seguimiento: "",
  comentario: "",
};

export default function CRMContactos() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [ahora, setAhora] = useState(`${formatFecha()} ${formatHora()}`);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [historialLocal, setHistorialLocal] = useState(() => readStored());

  useEffect(() => {
    (async () => {
      try {
        const data = await getMisClientes();
        setClientes(data);
        if (data.length > 0) setSeleccion(data[0]);
      } catch (e) {
        console.error("Error cargando clientes", e);
      }
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAhora(`${formatFecha()} ${formatHora()}`), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    writeStored(historialLocal);
  }, [historialLocal]);

  const clientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return clientes;
    const q = busqueda.toLowerCase();
    return clientes.filter(
      (c) =>
        (c.nombre_completo || "").toLowerCase().includes(q) ||
        (c.empresa || "").toLowerCase().includes(q) ||
        (c.correo || "").toLowerCase().includes(q) ||
        (c.celular || "").toLowerCase().includes(q) ||
        (c.telefono || "").toLowerCase().includes(q)
    );
  }, [busqueda, clientes]);

  const historial = useMemo(() => {
    if (!seleccion) return [];
    return historialLocal[seleccion.id] || [];
  }, [seleccion, historialLocal]);

  const handleAdd = () => {
    if (!seleccion) return;
    if (!form.comentario.trim()) return;

    const nuevo = {
      fecha: formatFecha(),
      hora: formatHora(),
      canal: form.canal,
      tipo: form.tipoCom,
      gestion: form.gestion,
      seguimiento: form.seguimiento,
      comentario: form.comentario.trim(),
    };

    setHistorialLocal((prev) => ({
      ...prev,
      [seleccion.id]: [nuevo, ...(prev[seleccion.id] || [])],
    }));

    setForm((prev) => ({ ...initialForm, canal: prev.canal, tipoCom: prev.tipoCom }));
    setMostrarModal(false);
  };

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320] to-[#0b1320]/90 overflow-hidden">
      <div className="h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">CRM</h1>
            <p className="text-sm text-white/70">
              Selecciona un cliente y registra los contactos desde aquí mismo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-64 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-4 p-4 overflow-hidden">
          {/* Lista de clientes */}
          <div className="h-full rounded-2xl border border-white/10 bg-[#1f2838] backdrop-blur-sm overflow-hidden shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)]">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between text-white/80 bg-white/5">
              <span className="font-semibold">Clientes</span>
              <span className="text-xs text-white/60">{clientesFiltrados.length} encontrados</span>
            </div>
            <div className="h-[calc(100%-52px)] overflow-y-auto divide-y divide-white/5">
              {clientesFiltrados.length === 0 ? (
                <div className="p-4 text-sm text-white/70">Sin clientes.</div>
              ) : (
                clientesFiltrados.map((c) => {
                  const activo = seleccion?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSeleccion(c)}
                      className={`w-full text-left px-4 py-3 transition ${
                        activo
                          ? "bg-white/15 text-white shadow-inner shadow-cyan-500/20 border-l-2 border-cyan-400/60"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold">{c.nombre_completo || "Sin nombre"}</div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-white/10">
                          {c.categoria || "N/A"}
                        </span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">{c.empresa || "Sin empresa"}</div>
                      <div className="text-xs text-white/60">{c.correo || c.celular || c.telefono || "-"}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Historial + nuevo contacto */}
          <div className="h-full rounded-2xl bg-white shadow-[0_15px_50px_-20px_rgba(0,0,0,0.45)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-[#183659] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {seleccion
                    ? `Registro de contactos — ${seleccion.nombre_completo || seleccion.nombre || "Cliente"}`
                    : "Selecciona un cliente"}
                </h3>
                <p className="text-xs text-white/70">Captura rápida de gestiones y seguimiento.</p>
              </div>
              <div className="text-xs text-white/60">{ahora}</div>
            </div>

            {seleccion ? (
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-semibold text-slate-800">Historial de contactos</h4>
                    <p className="text-xs text-slate-500">
                      {historial.length} registro{historial.length === 1 ? "" : "s"} guardado{historial.length === 1 ? "" : "s"}.
                    </p>
                  </div>
                  <button
                    onClick={() => setMostrarModal(true)}
                    className="h-10 px-4 rounded-lg bg-[#183659] text-white font-semibold hover:brightness-110 shadow-sm"
                  >
                    Nuevo contacto
                  </button>
                </div>

                <div className="p-5">
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 text-slate-700 px-4 py-2 font-semibold">Historial</div>
                    <div className="max-h-[420px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700">
                            <th className="px-3 py-2 text-left">Fecha</th>
                            <th className="px-3 py-2 text-left">Hora</th>
                            <th className="px-3 py-2 text-left">Gestión</th>
                            <th className="px-3 py-2 text-left">Seguimiento</th>
                            <th className="px-3 py-2 text-left">Canal</th>
                            <th className="px-3 py-2 text-left">Tipo</th>
                            <th className="px-3 py-2 text-left">Comentario</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historial.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                                Sin registros todavía.
                              </td>
                            </tr>
                          ) : (
                            historial.map((h, i) => (
                              <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                                <td className="px-3 py-2">{h.fecha}</td>
                                <td className="px-3 py-2">{h.hora}</td>
                                <td className="px-3 py-2">{h.gestion}</td>
                                <td className="px-3 py-2">{h.seguimiento || "-"}</td>
                                <td className="px-3 py-2">{h.canal}</td>
                                <td className="px-3 py-2">{h.tipo}</td>
                                <td className="px-3 py-2">{h.comentario}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 bg-white">
                Selecciona un cliente para registrar contactos.
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrarModal && seleccion && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMostrarModal(false)} aria-hidden="true" />
          <div className="relative z-[201] w-[900px] max-w-[95vw] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#183659] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Registro de contactos — {seleccion.nombre_completo || seleccion.nombre || "Cliente"}
              </h3>
              <span className="text-xs text-white/70">{`${formatFecha()} ${formatHora()}`}</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Fecha y hora (auto)</label>
                  <input
                    value={`${formatFecha()} ${formatHora()}`}
                    readOnly
                    disabled
                    className="h-11 rounded-lg border border-slate-300 px-3 bg-slate-50 text-slate-700"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Canal</label>
                  <select
                    value={form.canal}
                    onChange={(e) => setForm((f) => ({ ...f, canal: e.target.value }))}
                    className="h-11 rounded-lg border border-slate-300 px-3 bg-white"
                  >
                    <option>WhatsApp</option>
                    <option>Llamada</option>
                    <option>Correo</option>
                    <option>Presencial</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Tipo de comunicación</label>
                  <select
                    value={form.tipoCom}
                    onChange={(e) => setForm((f) => ({ ...f, tipoCom: e.target.value }))}
                    className="h-11 rounded-lg border border-slate-300 px-3 bg-white"
                  >
                    <option>Entrante</option>
                    <option>Saliente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Tipo de gestión</label>
                  <select
                    value={form.gestion}
                    onChange={(e) => setForm((f) => ({ ...f, gestion: e.target.value }))}
                    className="h-11 rounded-lg border border-slate-300 px-3 bg-white"
                  >
                    <option>Contacto</option>
                    <option>Seguimiento</option>
                    <option>Cotizacion</option>
                    <option>Cita</option>
                    <option>Visita Tecnica</option>
                    <option>Cierre</option>
                    <option>No contesta</option>
                    <option>Proceso de Instalacion</option>
                    <option>Venta</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Seguimiento</label>
                  <input
                    type="date"
                    value={form.seguimiento}
                    onChange={(e) => setForm((f) => ({ ...f, seguimiento: e.target.value }))}
                    className="h-11 rounded-lg border border-slate-300 px-3 bg-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Comentario</label>
                  <textarea
                    rows={2}
                    value={form.comentario}
                    onChange={(e) => setForm((f) => ({ ...f, comentario: e.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 h-11 bg-white"
                    placeholder="Ej. Cliente solicita comparar inversores..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleAdd}
                  className="h-10 px-4 rounded-lg bg-[#183659] text-white font-semibold hover:brightness-110"
                >
                  Agregar registro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // noop
  }
}
