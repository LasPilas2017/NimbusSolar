// src/modules/vendedor/ui/pages/Cotizaciones.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Pantalla "Mis Cotizaciones" del SISTEMA DEL VENDEDOR (tema azul).
//
// - Lista SOLO la **última cotización por cliente** usando la vista:
//      v_cotizaciones_ultima_por_cliente
// - Permite filtrar por estado y buscar por código / cliente / sistema.
// - Botón "Ingresar" abre el formulario <FormMisCotizaciones /> en modo NUEVO.
// - Al guardar, se inserta en la tabla real:
//      cotizaciones_aprobacion
//   mediante el caso de uso CreateCotizacionUseCase.
// - Al hacer clic en el nombre del cliente se abre el historial completo con:
//      <HistorialCotCliente />.
//
// CONEXIONES A BD (vía casos de uso + repositorio):
//   - Vista  : v_cotizaciones_ultima_por_cliente  (solo lectura)
//   - Tabla  : cotizaciones_aprobacion            (insert de nuevas cotizaciones)
// -----------------------------------------------------------------------------

import React, { useMemo, useState, useEffect } from "react";

// UI internas del módulo vendedor
import FormMisCotizaciones from "../components/FormMisCotizaciones.jsx";
import HistorialCotCliente from "../components/HistorialCotCliente.jsx";

// Cliente Supabase global del proyecto
import supabase from "../../../../supabase.js";

// Repositorio + casos de uso (arquitectura limpia)
import { CotizacionesSupabaseRepository } from "../../infra/supabase/CotizacionesSupabaseRepository.js";
import { GetUltimasCotizacionesUseCase } from "../../application/use-cases/getUltimasCotizaciones.js";
import { CreateCotizacionUseCase } from "../../application/use-cases/createCotizacion.js";

export default function Cotizaciones() {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [categoria, setCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [mounted, setMounted] = useState(false);
  const [abrirForm, setAbrirForm] = useState(false);

  // datos
  const [rows, setRows] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // filtro por cliente (para cuando lo uses más adelante)
  const [clienteFiltro, setClienteFiltro] = useState(null);

  // modal historial
  const [histOpen, setHistOpen] = useState(false);
  const [histCliente, setHistCliente] = useState({ id: null, nombre: "" });

  // ================== CASOS DE USO / REPOSITORIO ==================
  const cotizacionesRepo = useMemo(
    () => new CotizacionesSupabaseRepository(supabase),
    []
  );
  const getUltimasUC = useMemo(
    () => new GetUltimasCotizacionesUseCase(cotizacionesRepo),
    [cotizacionesRepo]
  );
  const createCotizacionUC = useMemo(
    () => new CreateCotizacionUseCase(cotizacionesRepo),
    [cotizacionesRepo]
  );

  // ================== EFECTOS DE MONTAJE ==================
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // bloquear scroll cuando el modal del form está abierto
  useEffect(() => {
    if (!abrirForm) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [abrirForm]);

  const infoCategoria = {
    todas: { titulo: "Todas las cotizaciones", desc: "Listado completo." },
    pendiente: { titulo: "Cotizaciones pendientes", desc: "A la espera de decisión." },
    enviadas: { titulo: "Cotizaciones enviadas", desc: "Enviadas al cliente." },
    rechazadas: { titulo: "Cotizaciones rechazadas", desc: "No aprobadas o descartadas." },
    autorizadas: { titulo: "Cotizaciones autorizadas", desc: "Aprobadas por el cliente." },
    borrador: { titulo: "Borradores", desc: "Aún sin enviar." },
  };

  // ================== CARGAR ÚLTIMAS COTIZACIONES (VISTA) ==================
  async function cargarUltimas() {
    setCargando(true);
    setError(null);
    try {
      const mapped = await getUltimasUC.execute();
      setRows(mapped);
    } catch (e) {
      console.error("Error cargando cotizaciones:", e);
      setError(e?.message || "Error cargando cotizaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUltimas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seleccionarCategoria = (cat) => {
    setCategoria(cat);
    setDropdownAbierto(false);
  };

  const handleIngresarCotizacion = () => setAbrirForm(true);
  const handleCancelForm = () => setAbrirForm(false);

  // ================== GUARDAR NUEVA COTIZACIÓN (INSERT REAL) ==================
  const handleSuccessForm = async (nueva) => {
    try {
      await createCotizacionUC.execute(nueva);
      await cargarUltimas();
      setAbrirForm(false);
    } catch (e) {
      console.error("Error guardando nueva cotización:", e);
      alert("No se pudo guardar la cotización. Revisa la consola.");
    }
  };

  // abrir historial por cliente
  const abrirHistorial = (id, nombre) => {
    setHistCliente({ id, nombre });
    setHistOpen(true);
  };

  // ================== FILTROS EN MEMORIA ==================
  const listadoFiltrado = useMemo(() => {
    let data = [...rows];

    if (categoria !== "todas") {
      data = data.filter((r) => (r.estado || "pendiente") === categoria);
    }

    if (clienteFiltro?.id) {
      data = data.filter((r) => r.cliente_id === clienteFiltro.id);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      data = data.filter(
        (r) =>
          (r.codigo || "").toLowerCase().includes(q) ||
          (r.cliente_nombre || "").toLowerCase().includes(q) ||
          (r.sistema_nombre || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [rows, categoria, busqueda, clienteFiltro]);

  // ================== RENDER ==================
  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90">
      <div
        className={`relative w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md
                    shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-500
                    ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-5 sm:p-6 border-b border-white/10">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white drop-shadow">
              Mis Cotizaciones
            </h1>
            <p className="text-sm text-white/70">
              {(infoCategoria[categoria] || infoCategoria.todas).titulo} ·{" "}
              {(infoCategoria[categoria] || infoCategoria.todas).desc}
              {clienteFiltro?.id && (
                <span className="ml-2 inline-flex items-center gap-2 text-emerald-200">
                  · Cliente: <strong className="text-white/90">{clienteFiltro.nombre}</strong>
                  <button
                    onClick={() => setClienteFiltro(null)}
                    className="text-[11px] px-2 py-0.5 rounded border border-white/10 bg-white/10 hover:bg-white/15"
                  >
                    Quitar filtro
                  </button>
                </span>
              )}
            </p>
          </div>

          {/* Controles */}
          <div className="flex flex-wrap justify-start md:justify-end items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cotización..."
              className="flex-1 md:flex-none min-w-[180px] md:w-72 rounded-xl border border-white/10 bg-white/10
                         px-4 py-2.5 text-sm text-white placeholder-white/60
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            />

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownAbierto((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
                           text-white border border-white/10 shadow-md
                           bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400
                           focus:outline-none"
              >
                Categorías
                <svg
                  className={`h-4 w-4 transition-transform ${dropdownAbierto ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                </svg>
              </button>

              {dropdownAbierto && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0b1320]/95 backdrop-blur-md shadow-2xl z-20">
                  <div className="py-1 text-sm text-white/90">
                    <button onClick={() => seleccionarCategoria("pendiente")} className="w-full text-left px-4 py-2 hover:bg-white/10">Pendientes</button>
                    <button onClick={() => seleccionarCategoria("enviadas")} className="w-full text-left px-4 py-2 hover:bg-white/10">Enviadas</button>
                    <button onClick={() => seleccionarCategoria("autorizadas")} className="w-full text-left px-4 py-2 hover:bg-white/10">Autorizadas</button>
                    <button onClick={() => seleccionarCategoria("rechazadas")} className="w-full text-left px-4 py-2 hover:bg-white/10">Rechazadas</button>
                    <button onClick={() => seleccionarCategoria("borrador")} className="w-full text-left px-4 py-2 hover:bg-white/10">Borradores</button>
                    <div className="my-1 border-t border-white/10" />
                    <button onClick={() => seleccionarCategoria("todas")} className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/10">Ver todas</button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleIngresarCotizacion}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
                         text-white border border-white/10 shadow-md
                         bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400
                         focus:outline-none"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a.75.75 0 01.75.75V9.25h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5H5.25a.75.75 0 010-1.5h3.5V5.75A.75.75 0 0110 5z" />
              </svg>
              Ingresar
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 h-[calc(100%-110px)] flex flex-col">
          <div className="no-scrollbar flex-1 overflow-auto rounded-2xl border border-white/10 bg-[#0f1a2b]/40">
            {cargando ? (
              <div className="p-6 text-sm text-white/70">Cargando cotizaciones…</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-300">Error: {String(error)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#0b1320]/85 backdrop-blur border-b border-white/10">
                    <tr className="text-left text-white/85">
                      <th className="px-3 py-2 text-[13px] font-medium">Código</th>
                      <th className="px-3 py-2 text-[13px] font-medium">Cliente</th>
                      <th className="px-3 py-2 text-[13px] font-medium">Tipo de instalación</th>
                      <th className="px-3 py-2 text-[13px] font-medium text-right">Monto (Q)</th>
                      <th className="px-3 py-2 text-[13px] font-medium">Estado</th>
                      <th className="px-3 py-2 text-[13px] font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listadoFiltrado.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`${idx % 2 === 0 ? "bg-white/0" : "bg-white/5"} hover:bg-cyan-400/10 transition-colors`}
                      >
                        <td className="px-4 py-3 text-white">{c.codigo}</td>

                        {/* Clic abre historial del cliente */}
                        <td className="px-4 py-3">
                          <button
                            className="text-left text-white/90 underline decoration-dotted underline-offset-2 hover:text-emerald-200"
                            onClick={() => abrirHistorial(c.cliente_id, c.cliente_nombre)}
                            title="Ver historial de cotizaciones"
                          >
                            {c.cliente_nombre}
                          </button>
                        </td>

                        <td className="px-4 py-3 text-white/90">{c.sistema_nombre}</td>
                        <td className="px-4 py-3 text-right text-white/90">
                          {Number(0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-[11px] font-medium border ${
                              c.estado === "pendiente"
                                ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/30"
                                : c.estado === "enviadas" || c.estado === "enviada"
                                ? "bg-amber-400/15 text-amber-200 border-amber-300/30"
                                : c.estado === "autorizadas" || c.estado === "autorizada"
                                ? "bg-sky-400/15 text-sky-200 border-sky-300/30"
                                : c.estado === "rechazadas" || c.estado === "rechazada"
                                ? "bg-rose-400/15 text-rose-200 border-rose-300/30"
                                : "bg-white/10 text-white/80 border-white/20"
                            }`}
                          >
                            {c.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/90">
                          {c.fecha ? new Date(c.fecha).toISOString().slice(0, 10) : "—"}
                        </td>
                      </tr>
                    ))}

                    {listadoFiltrado.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-white/60" colSpan={6}>
                          Sin resultados…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-3 text-[11px] text-white/50">
            *Mostrando 1 (la última) por cliente. Haz clic en el nombre para ver el historial.
          </div>
        </div>

        {/* MODAL: Crear cotización (modo NUEVO) */}
        {abrirForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelForm}
            />
            <div
              className="relative z-10 w-full max-w-[min(900px,calc(100vw-1rem))]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto w-full rounded-3xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
                <div className="max-h-[90vh] overflow-y-auto no-scrollbar">
                  <FormMisCotizaciones
                    modo="nuevo"
                    onCancel={handleCancelForm}
                    onSuccess={handleSuccessForm}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Historial por cliente */}
        {histOpen && histCliente.id && (
          <HistorialCotCliente
            clienteId={histCliente.id}
            clienteNombre={histCliente.nombre}
            onClose={() => setHistOpen(false)}
            onRefreshMain={cargarUltimas}
          />
        )}
      </div>
    </div>
  );
}
