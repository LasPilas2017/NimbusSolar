// src/componentes/HistorialCotCliente.jsx
// Muestra TODAS las cotizaciones de un cliente (más reciente primero)
// Abre FormMisCotizaciones en modo "editar" PRECARGADO con la cotización seleccionada.

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import supabase from "../../../../supabase.js";
import FormMisCotizaciones from "./FormMisCotizaciones";

const TABLE_LISTADO = "v_cotizaciones_listado";
const TABLE_BASE = "cotizaciones_aprobacion";

export default function HistorialCotCliente({
  clienteId,
  clienteNombre = "",
  onClose,
  onRefreshMain = undefined, // 👈 valor por defecto en lugar de defaultProps
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Estado del modal de edición
  const [editQuoteId, setEditQuoteId] = useState(null);
  const [editPrefill, setEditPrefill] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Última cotización (solo para marcar visualmente la fila más reciente)
  const ultima = useMemo(() => (rows?.length ? rows[0] : null), [rows]);

  // Cargar historial completo del cliente
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from(TABLE_LISTADO)
          .select(
            "id,codigo,cliente_id,sistema_id,sistema_nombre,estado,created_at,fecha"
          )
          .eq("cliente_id", clienteId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!cancel) {
          const mapped = (data || []).map((r) => ({
            id: r.id,
            codigo: r.codigo,
            cliente_id: r.cliente_id,
            sistema_id: r.sistema_id,
            sistema_nombre: r.sistema_nombre || "—",
            estado: (r.estado || "").toLowerCase(),
            fecha: (r.fecha || r.created_at)
              ? new Date(r.fecha || r.created_at).toISOString()
              : null,
          }));
          setRows(mapped);
        }
      } catch (e) {
        if (!cancel) setErr(e?.message || "Error cargando historial.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [clienteId]);

  // Abrir edición: trae la fila base y arma prefill para el formulario
  const abrirEdicion = async (id) => {
    setEditQuoteId(id);
    setEditLoading(true);
    setEditPrefill(null);

    try {
      const { data, error } = await supabase
        .from(TABLE_BASE)
        .select(
          `
          id, codigo, estado, created_at, updated_at,
          cliente_id, sistema_id,
          kw_dia,
          items,
          consumos,
          consumo_stats,
          monto,
          fecha
        `
        ) // SOLO columnas que existen en cotizaciones_aprobacion
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      const prefill = data
        ? {
            id: data.id,
            codigo: data.codigo || "",
            estado: (data.estado || "").toLowerCase(),
            created_at: data.created_at || null,
            updated_at: data.updated_at || null,
            cliente_id: data.cliente_id || null,
            sistema_id: data.sistema_id || null,
            kw_dia: data.kw_dia ?? "",
            // detalle
            items: Array.isArray(data.items) ? data.items : [],
            consumos: Array.isArray(data.consumos) ? data.consumos : [],
            consumo_stats: data.consumo_stats || {},
            monto: data.monto ?? 0,
            fecha: data.fecha || null,
            // nombre del cliente sin join
            cliente: data.cliente_id
              ? { id: data.cliente_id, nombre: clienteNombre }
              : null,
          }
        : null;

      setEditPrefill(prefill);
    } catch (e) {
      console.error("editar.fetch:", e);
      setEditPrefill(null);
    } finally {
      setEditLoading(false);
    }
  };

  // Después de guardar en el form (UPDATE exitoso)
  const afterEditSuccess = async () => {
    setEditQuoteId(null);
    setEditPrefill(null);

    onRefreshMain && onRefreshMain();

    try {
      const { data, error } = await supabase
        .from(TABLE_LISTADO)
        .select(
          "id,codigo,cliente_id,sistema_id,sistema_nombre,estado,created_at,fecha"
        )
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((r) => ({
        id: r.id,
        codigo: r.codigo,
        cliente_id: r.cliente_id,
        sistema_id: r.sistema_id,
        sistema_nombre: r.sistema_nombre || "—",
        estado: (r.estado || "").toLowerCase(),
        fecha: (r.fecha || r.created_at)
          ? new Date(r.fecha || r.created_at).toISOString()
          : null,
      }));
      setRows(mapped);
    } catch (e) {
      console.error("Historial refresh:", e);
    }
  };

  // Helper visual para el badge de estado
  const estadoBadgeClass = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-emerald-400/15 text-emerald-200 border-emerald-300/30";
      case "enviadas":
      case "enviada":
        return "bg-amber-400/15 text-amber-200 border-amber-300/30";
      case "autorizadas":
      case "autorizada":
      case "aprobada":
      case "aprobadas":
        return "bg-sky-400/15 text-sky-200 border-sky-300/30";
      case "rechazadas":
      case "rechazada":
        return "bg-rose-400/15 text-rose-200 border-rose-300/30";
      case "borrador":
        return "bg-white/10 text-white/80 border-white/20";
      default:
        return "bg-white/10 text-white/80 border-white/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscuro que cierra todo el historial */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-full rounded-3xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                Historial de {clienteNombre}
              </h3>
              <p className="text-white/70 text-sm">
                Cotizaciones (más recientes primero)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white border border-white/10 bg-white/10 hover:bg-white/15"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="text-white/70 text-sm">Cargando…</div>
            ) : err ? (
              <div className="text-rose-300 text-sm">Error: {String(err)}</div>
            ) : rows.length === 0 ? (
              <div className="text-white/70 text-sm">
                Sin cotizaciones para este cliente.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-[#0b1320]/85 backdrop-blur border-b border-white/10">
                    <tr className="text-left text-white/85">
                      <th className="px-3 py-2 text-[13px] font-medium">Código</th>
                      <th className="px-3 py-2 text-[13px] font-medium">
                        Tipo de instalación
                      </th>
                      <th className="px-3 py-2 text-[13px] font-medium">Estado</th>
                      <th className="px-3 py-2 text-[13px] font-medium">Fecha</th>
                      <th className="px-3 py-2 text-[13px] font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => {
                      const esUltima = ultima && r.id === ultima.id;

                      // ✅ Regla de edición:
                      // Se puede editar si el estado es 'borrador' o 'rechazada'
                      // No se puede editar si está 'pendiente' (ni si está aprobada).
                      const canEdit =
                        r.estado === "borrador" ||
                        r.estado === "rechazada" ||
                        r.estado === "rechazadas";

                      return (
                        <tr
                          key={r.id}
                          className={`${
                            idx % 2 === 0 ? "bg-white/0" : "bg-white/5"
                          } ${esUltima ? "ring-1 ring-emerald-400/30" : ""}`}
                        >
                          <td className="px-4 py-3 text-white">{r.codigo}</td>
                          <td className="px-4 py-3 text-white/90">
                            {r.sistema_nombre}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-[11px] font-medium border ${estadoBadgeClass(
                                r.estado
                              )}`}
                            >
                              {r.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white/90">
                            {r.fecha
                              ? new Date(r.fecha).toISOString().slice(0, 10)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {canEdit ? (
                              <button
                                onClick={() => abrirEdicion(r.id)}
                                className="text-[11px] px-3 py-1 rounded border border-white/10 text-white/90
                                           bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400"
                                title={
                                  r.estado === "borrador"
                                    ? "Editar cotización"
                                    : "Modificar y reenviar"
                                }
                              >
                                {r.estado === "borrador"
                                  ? "Editar"
                                  : "Modificar y reenviar"}
                              </button>
                            ) : (
                              <span
                                className="text-[11px] px-3 py-1 rounded border border-white/10 text-white/50 bg-white/5 cursor-not-allowed"
                                title={
                                  r.estado === "pendiente"
                                    ? "No editable mientras esté pendiente"
                                    : "No editable"
                                }
                              >
                                No editable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Modal de EDICIÓN (con precarga) === */}
      {editQuoteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setEditQuoteId(null);
              setEditPrefill(null);
            }}
          />
          <div
            className="relative z-10 w-full max-w-[min(900px,calc(100vw-1rem))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-full rounded-3xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
              <div className="max-h-[90vh] overflow-y-auto no-scrollbar">
                {editLoading ? (
                  <div className="p-6 text-white/80 text-sm">
                    Cargando cotización…
                  </div>
                ) : (
                  <FormMisCotizaciones
                    modo="editar"
                    cotizacionId={editQuoteId}
                    prefill={editPrefill}
                    onCancel={() => {
                      setEditQuoteId(null);
                      setEditPrefill(null);
                    }}
                    onSuccess={afterEditSuccess}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

HistorialCotCliente.propTypes = {
  clienteId: PropTypes.string.isRequired,
  clienteNombre: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onRefreshMain: PropTypes.func, // opcional
};
