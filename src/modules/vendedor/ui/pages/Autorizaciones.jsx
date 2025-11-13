// -----------------------------------------------------------------------------
// 📄 AUTORIZACIONES (Supervisor de Ventas)
// -----------------------------------------------------------------------------
// Este componente muestra las cotizaciones pendientes o enviadas para revisión.
// Permite al SUPERVISOR DE VENTAS:
//   ✅ Ver todas las cotizaciones de todos los vendedores.
//   ✅ Editar cantidades y precios unitarios de los ítems.
//   ✅ Revisar la información general de la cotización (cliente, consumo, sistema).
//   ✅ Jugar con porcentajes de ganancia y tarjeta (solo a nivel de diseño por ahora).
//
// TABLAS Y CAMPOS UTILIZADOS (a nivel de front)
// -----------------------------------------------------------------------------
// Vista: public.v_cotizaciones_autorizacion
//  - id
//  - codigo
//  - estado
//  - fecha
//  - monto_calculado
//  - items (jsonb[])
//  - vendedor_uid
//  - vendedor_nombre
//  - (en el futuro: datos de cliente, consumos, sistema, porcentajes, etc.)
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../../../supabase";

// Helpers
const money = (v) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
    Number(v || 0)
  );

const sum = (arr) => arr.reduce((a, b) => a + Number(b || 0), 0);

// Fallback seguro para leer vendedor
function resolveVendedorNombre(row) {
  return (
    row.vendedor_nombre ||
    row.vendedorName ||
    row.creado_por_nombre ||
    row.creado_por_name ||
    row.vendedor ||
    "—"
  );
}

export default function Autorizaciones({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal edición
  const [editId, setEditId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);

  // 📊 estados de diseño para porcentajes (solo front, aún no se guardan)
  const [porcGanancia, setPorcGanancia] = useState(0);
  const [porcTarjeta, setPorcTarjeta] = useState(0);

  const estadosFiltrados = useMemo(() => ["pendiente", "enviada"], []);

  const cargar = async () => {
    setLoading(true);
    setErr("");

    try {
      const rol = String(user?.rol || "").toLowerCase();
      const { data: authData } = await supabase.auth.getUser();
      const authUid = authData?.user?.id || null;

      // 🔹 Base query desde la vista
      let query = supabase
        .from("v_cotizaciones_autorizacion")
        .select(
          `
          id,
          codigo,
          estado,
          fecha,
          monto_calculado,
          items,
          vendedor_uid,
          vendedor_nombre
        `
        )
        .in("estado", estadosFiltrados)
        .order("fecha", { ascending: false });

      // 🔹 Si es vendedor, solo muestra sus cotizaciones
      if (rol === "ventas" && authUid) {
        query = query.eq("vendedor_uid", authUid);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped =
        (data || []).map((r) => ({
          ...r,
          estado: String(r.estado || "").toLowerCase(),
          vendedorLabel: resolveVendedorNombre(r),
          monto: Number(r.monto_calculado || 0),
          items: Array.isArray(r.items)
            ? r.items.map((it) => ({
                tipo: it.tipo || "",
                articulo: it.articulo || "",
                detalle: it.detalle ?? "",
                cantidad: Number(it.cantidad || 0),
                precio: Number(it.precio || 0),
              }))
            : [],
        })) || [];

      setRows(mapped);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error cargando cotizaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrir = (row) => {
    setEditId(row.id);
    setEditRow(JSON.parse(JSON.stringify(row)));
    // 🔄 al abrir la cotización, inicializamos porcentajes (por ahora en 0)
    setPorcGanancia(Number(row.porc_ganancia || 0));
    setPorcTarjeta(Number(row.porc_tarjeta || 0));
  };

  const cerrar = () => {
    setEditId(null);
    setEditRow(null);
    setPorcGanancia(0);
    setPorcTarjeta(0);
  };

  const recomputeMonto = (items) =>
    sum(items.map((it) => Number(it.cantidad || 0) * Number(it.precio || 0)));

  const onChangeItem = (idx, field, value) => {
    const next = { ...editRow };
    const items = [...next.items];
    const it = { ...items[idx] };
    if (field === "precio") it.precio = Number(value || 0);
    if (field === "cantidad") it.cantidad = Number(value || 0);
    items[idx] = it;
    next.items = items;
    next.monto = recomputeMonto(items); // monto base sin porcentajes
    setEditRow(next);
  };

  const guardar = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const payload = {
        items: editRow.items,
        monto: Number(editRow.monto || 0),
        // 🔜 en el futuro aquí mandaremos porc_ganancia y porc_tarjeta
        supervisor_id: user?.id || null,
        supervisor_nombre: user?.nombreCompleto || user?.nombre || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("cotizaciones_aprobacion")
        .update(payload)
        .eq("id", editRow.id);

      if (error) throw error;

      await cargar();
      cerrar();
    } catch (e) {
      alert(e.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    if (!editRow) return;
    setSaving(true);
    try {
      const payload = {
        items: editRow.items,
        monto: Number(editRow.monto || 0),
        estado: nuevoEstado,
        // 🔜 en el futuro aquí también se guardarán los porcentajes finales
        supervisor_id: user?.id || null,
        supervisor_nombre: user?.nombreCompleto || user?.nombre || null,
        fecha_autorizacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("cotizaciones_aprobacion")
        .update(payload)
        .eq("id", editRow.id);

      if (error) throw error;

      await cargar();
      cerrar();
    } catch (e) {
      alert(e.message || "No se pudo actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };

  // 📊 Cálculos de diseño para el resumen con porcentajes
  const subtotal = editRow ? recomputeMonto(editRow.items || []) : 0;
  const gananciaQ = subtotal * (Number(porcGanancia) / 100 || 0);
  const subtotalConGanancia = subtotal + gananciaQ;
  const tarjetaQ = subtotalConGanancia * (Number(porcTarjeta) / 100 || 0);
  const totalFinal = subtotalConGanancia + tarjetaQ;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">
            Autorizaciones
          </h1>
          <p className="text-white/70 text-sm">
            Cotizaciones pendientes (y enviadas) para revisión del supervisor.
          </p>
        </div>
        <button
          onClick={cargar}
          className="text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white hover:bg-white/15"
        >
          Recargar
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-4 overflow-x-auto">
        {loading ? (
          <div className="text-white/80 text-sm">Cargando…</div>
        ) : err ? (
          <div className="text-rose-300 text-sm">{String(err)}</div>
        ) : rows.length === 0 ? (
          <div className="text-white/70 text-sm">
            No hay cotizaciones pendientes/enviadas.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-[#0b1320]/80 backdrop-blur border-b border-white/10">
              <tr className="text-left text-white/85">
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Vendedor</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2 text-right">Monto</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={i % 2 ? "bg-white/5" : "bg-transparent"}
                >
                  <td className="px-3 py-2 text-white">{r.codigo}</td>
                  <td className="px-3 py-2 text-white/90">{r.vendedorLabel}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-medium border ${
                        r.estado === "pendiente"
                          ? "bg-amber-400/15 text-amber-200 border-amber-300/30"
                          : "bg-cyan-400/15 text-cyan-200 border-cyan-300/30"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-white/80">
                    {r.fecha ? String(r.fecha).slice(0, 10) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-white/90">
                    {money(r.monto || 0)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => abrir(r)}
                      className="text-[11px] px-3 py-1 rounded border border-white/10 text-white/90 bg-white/10 hover:bg-white/20"
                    >
                      Revisión
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL EDICIÓN / REVISIÓN */}
      {editId && editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !saving && cerrar()}
          />
          <div
            className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 bg-[#0b1320] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {editRow.codigo} · {resolveVendedorNombre(editRow)}
                </h3>
                <p className="text-white/60 text-sm">
                  Estado actual: <b>{editRow.estado}</b>
                </p>
              </div>
              <button
                className="px-3 py-1 rounded bg-white/10 border border-white/10"
                onClick={() => !saving && cerrar()}
              >
                Cerrar
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* 🧾 Bloque de información general (diseño) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {/* Cliente */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <h4 className="text-xs font-semibold text-white/80 mb-2">
                    Cliente
                  </h4>
                  <p className="text-sm font-medium">
                    {editRow.cliente_nombre || "Nombre del cliente"}
                  </p>
                  <p className="text-xs text-white/60">
                    Código:{" "}
                    <span className="font-mono">
                      {editRow.codigo || "CTZ-XXXXXX"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Teléfono / contacto:{" "}
                    <span className="font-medium">
                      {editRow.cliente_telefono || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Dirección:{" "}
                    <span className="font-medium">
                      {editRow.cliente_direccion || "—"}
                    </span>
                  </p>
                </div>

                {/* Consumo */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <h4 className="text-xs font-semibold text-white/80 mb-2">
                    Consumo registrado
                  </h4>
                  <p className="text-xs text-white/60">
                    kWh/día:{" "}
                    <span className="font-semibold text-white/90">
                      {editRow.consumo_kwh_dia || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    kWh/mes:{" "}
                    <span className="font-semibold text-white/90">
                      {editRow.consumo_kwh_mes || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Factura promedio:{" "}
                    <span className="font-semibold text-white/90">
                      {editRow.factura_promedio
                        ? money(editRow.factura_promedio)
                        : "—"}
                    </span>
                  </p>
                </div>

                {/* Sistema */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <h4 className="text-xs font-semibold text-white/80 mb-2">
                    Sistema propuesto
                  </h4>
                  <p className="text-xs text-white/60">
                    Tipo de sistema:{" "}
                    <span className="font-semibold text-white/90">
                      {editRow.tipo_sistema || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Potencia instalada:{" "}
                    <span className="font-semibold text-white/90">
                      {editRow.kw_instalados || "—"} kW
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Inversor:{" "}
                    <span className="font-semibold text-white/90">
                      {editRow.modelo_inversor || "—"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Tabla de ítems con precios */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Artículos de la cotización
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/80 border-b border-white/10">
                        <th className="px-2 py-2">Tipo</th>
                        <th className="px-2 py-2">Artículo</th>
                        <th className="px-2 py-2">Detalle</th>
                        <th className="px-2 py-2 text-right">Cant.</th>
                        <th className="px-2 py-2 text-right">Precio</th>
                        <th className="px-2 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRow.items.map((it, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="px-2 py-2">{it.tipo}</td>
                          <td className="px-2 py-2">{it.articulo}</td>
                          <td className="px-2 py-2">{it.detalle}</td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={it.cantidad}
                              onChange={(e) =>
                                onChangeItem(idx, "cantidad", e.target.value)
                              }
                              className="w-20 text-right px-2 py-1 rounded bg-white/10 border border-white/10 text-xs"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={it.precio}
                              onChange={(e) =>
                                onChangeItem(idx, "precio", e.target.value)
                              }
                              className="w-24 text-right px-2 py-1 rounded bg-white/10 border border-white/10 text-xs"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            {money(Number(it.cantidad) * Number(it.precio))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan={5}
                          className="px-2 py-3 text-right font-semibold text-xs sm:text-sm"
                        >
                          Subtotal ítems:
                        </td>
                        <td className="px-2 py-3 text-right font-semibold">
                          {money(subtotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Resumen con porcentajes (solo diseño por ahora) */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-white">
                  Resumen y porcentajes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  {/* Subtotal */}
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                    <p className="text-white/60">Subtotal (ítems)</p>
                    <p className="text-lg font-semibold">
                      {money(subtotal)}
                    </p>
                  </div>

                  {/* % Ganancia */}
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/60">% ganancia</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={porcGanancia}
                        onChange={(e) => setPorcGanancia(e.target.value)}
                        className="w-20 text-right px-2 py-1 rounded bg-white/10 border border-white/20 text-xs"
                      />
                    </div>
                    <p className="text-white/60">
                      Ganancia:{" "}
                      <span className="font-semibold text-white">
                        {money(gananciaQ)}
                      </span>
                    </p>
                  </div>

                  {/* % Tarjeta */}
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white/60">% tarjeta</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={porcTarjeta}
                        onChange={(e) => setPorcTarjeta(e.target.value)}
                        className="w-20 text-right px-2 py-1 rounded bg-white/10 border border-white/20 text-xs"
                      />
                    </div>
                    <p className="text-white/60">
                      Recargo tarjeta:{" "}
                      <span className="font-semibold text-white">
                        {money(tarjetaQ)}
                      </span>
                    </p>
                  </div>

                  {/* Total final */}
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-300/40 p-3">
                    <p className="text-white/70 text-xs">Total final (vista)</p>
                    <p className="text-lg font-semibold text-emerald-200">
                      {money(totalFinal)}
                    </p>
                    <p className="text-[11px] text-white/60 mt-1">
                      *Este total es solo diseño por ahora. Más adelante
                      lo conectamos para que se guarde en la tabla.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer botones */}
            <div className="p-5 border-t border-white/10 flex flex-wrap gap-2 justify-end">
              <button
                disabled={saving}
                onClick={guardar}
                className="px-4 py-2 rounded border border-white/10 bg-white/10 hover:bg-white/20"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                disabled={saving}
                onClick={() => cambiarEstado("rechazada")}
                className="px-4 py-2 rounded border border-rose-300/30 bg-rose-400/15 text-rose-200 hover:bg-rose-400/25"
              >
                Rechazar
              </button>
              <button
                disabled={saving}
                onClick={() => cambiarEstado("autorizada")}
                className="px-4 py-2 rounded border border-emerald-300/30 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
              >
                Autorizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
