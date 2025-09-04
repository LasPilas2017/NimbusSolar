import React, { useEffect, useMemo, useState } from "react";
import "../../../EstilosCSS/TablaProduccion.css";

/** Utilidades */
const GTQ = (n) =>
  "Q" + Number(n || 0).toLocaleString("es-GT", { maximumFractionDigits: 2 });

/**
 * Construye arreglo de fechas entre inicio y fin (ISO: YYYY-MM-DD).
 * - Encabezado como: "lun, 21 jul"
 * - `soloLaborables = true` => excluye sábados y domingos
 */
function buildFechas(rango, soloLaborables = true) {
  if (!rango?.inicio || !rango?.fin) return [];

  const out = [];
  const start = new Date(rango.inicio + "T00:00:00");
  const end = new Date(rango.fin + "T00:00:00");

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0 dom, 6 sáb
    if (soloLaborables && (dow === 0 || dow === 6)) continue;

    const wd = new Intl.DateTimeFormat("es-ES", { weekday: "short" })
      .format(d)
      .replace(".", "");
    const dd = new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(d);
    const mm = new Intl.DateTimeFormat("es-ES", { month: "short" })
      .format(d)
      .replace(".", "");
    out.push(`${wd}, ${dd} ${mm}`);
  }
  return out;
}

export default function ProduccionEstiloExcel({ rango }) {
  // Actividades y tarifas
  const actividades = useMemo(
    () => [
      { id: "hincado", nombre: "Hincado", tarifa: 75 },
      { id: "estructura", nombre: "Estructura", tarifa: 100 },
      { id: "panelado", nombre: "Panelado", tarifa: 60 },
      { id: "corte_alto", nombre: "Corte Alto", tarifa: 80 },
      { id: "corte_bajo", nombre: "Corte Bajo", tarifa: 55 },
      { id: "pull_out", nombre: "Pull Out", tarifa: 120 },
      { id: "perforacion", nombre: "Perforación", tarifa: 95 },
    ],
    []
  );

  // Fechas dinámicas según la quincena (por defecto solo días laborales)
  const fechas = useMemo(() => buildFechas(rango, true), [rango]);

  // Estado: cantidades por actividad/fecha
  const [cantidades, setCantidades] = useState({});

  // Reiniciar matriz cuando cambien fechas/actividades
  useEffect(() => {
    const base = {};
    for (const a of actividades) {
      base[a.id] = {};
      for (const f of fechas) base[a.id][f] = 0;
    }
    setCantidades(base);
  }, [actividades, fechas]);

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helpers de totales
  const totalCelda = (actId, fecha) => {
    const act = actividades.find((a) => a.id === actId);
    const cant = Number(cantidades[actId]?.[fecha] || 0);
    return cant * (act?.tarifa || 0);
  };

  const totalFilaQ = (actId) =>
    fechas.reduce((acc, f) => acc + totalCelda(actId, f), 0);

  const totalColCant = (fecha) =>
    actividades.reduce(
      (acc, a) => acc + Number(cantidades[a.id]?.[fecha] || 0),
      0
    );

  const totalColQ = (fecha) =>
    actividades.reduce((acc, a) => acc + totalCelda(a.id, fecha), 0);

  const totalGeneralQ = () =>
    actividades.reduce((acc, a) => acc + totalFilaQ(a.id), 0);

  // Edición de celda (solo cant)
  const onChangeCant = (actId, fecha, value) => {
    if (!edit || saving) return;
    const v = value === "" ? "" : Math.max(0, Number(value));
    setCantidades((prev) => ({
      ...prev,
      [actId]: { ...prev[actId], [fecha]: v },
    }));
  };

  // Guardar (simulado)
  const onGuardar = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setEdit(false);
    } finally {
      setSaving(false);
    }
  };

  const onKeyDownInput = (e) => {
    if (e.key === "Enter") onGuardar();
  };

  return (
    <div className="table-excel mt-6">
      {/* Overlay de guardado */}
      {saving && (
        <div className="saving-overlay">
          <div className="loader"></div>
          <div className="saving-text">Guardando…</div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="flex items-center justify-between -mt-4 mb-0">
        <div className="text-sm text-gray-600">{saving ? "• guardando…" : ""}</div>

        {!edit ? (
          <button
            className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold"
            onClick={() => setEdit(true)}
            disabled={saving}
          >
            Editar
          </button>
        ) : (
          <button
            className="px-3 py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold disabled:opacity-60"
            onClick={onGuardar}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        )}
      </div>

      {/* ⚠️ El scroll horizontal va en este wrapper */}
      <div className="scroll-x">
        <table>
          <thead>
            {/* Fila 1: encabezado principal */}
            <tr>
              <th className="st-actividad">PRODUCCIÓN</th>
              <th className="st-dinero">
                Dinero<br />GANADO
              </th>
              <th className="st-trabajo">
                Trabajo<br />HECHO
              </th>
              {fechas.map((f) => (
                <th key={f} colSpan={2}>{f}</th>
              ))}
            </tr>

            {/* Fila 2: totales por columna */}
            <tr className="row-total">
              <th className="st-actividad">TOTAL</th>
              <th className="st-dinero td-center">{GTQ(totalGeneralQ())}</th>
              <th className="st-trabajo td-center">
                {fechas.reduce((acc, f) => acc + totalColCant(f), 0)}
              </th>
              {fechas.map((f) => (
                <React.Fragment key={`tot-${f}`}>
                  <th className="td-center">{totalColCant(f)}</th>
                  <th className="td-center">{GTQ(totalColQ(f))}</th>
                </React.Fragment>
              ))}
            </tr>

            {/* Fila 3: sub-headers cant/total */}
            <tr>
              <th className="st-actividad"></th>
              <th className="st-dinero"></th>
              <th className="st-trabajo"></th>
              {fechas.map((_, i) => (
                <React.Fragment key={`sub-${i}`}>
                  <th className="col-cant">cant</th>
                  <th className="col-total">total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {actividades.map((a) => (
              <tr key={a.id}>
                <td className="st-actividad">{a.nombre}</td>
                <td className="st-dinero td-center">{GTQ(totalFilaQ(a.id))}</td>
                <td className="st-trabajo td-center">
                  {fechas.reduce(
                    (acc, f) => acc + Number(cantidades[a.id]?.[f] || 0),
                    0
                  )}
                </td>

                {fechas.map((f) => (
                  <React.Fragment key={`${a.id}-${f}`}>
                    {/* cant (editable) */}
                    <td className="td-center">
                      {edit ? (
                        <input
                          type="number"
                          min={0}
                          className="w-24 px-2 py-1 border rounded text-right"
                          value={cantidades[a.id]?.[f]}
                          onChange={(e) => onChangeCant(a.id, f, e.target.value)}
                          onKeyDown={onKeyDownInput}
                          disabled={saving}
                        />
                      ) : (
                        <span>{Number(cantidades[a.id]?.[f] || 0)}</span>
                      )}
                    </td>

                    {/* total (calculado) */}
                    <td className="td-center">{GTQ(totalCelda(a.id, f))}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
