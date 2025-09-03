import React, { useMemo, useState } from "react";
import "../../../EstilosCSS/TablaProduccion.css";

/** Utilidades */
const GTQ = (n) =>
  "Q" + Number(n || 0).toLocaleString("es-GT", { maximumFractionDigits: 2 });

export default function ProduccionEstiloExcelEditable() {
  // Actividades y tarifas (puedes cambiarlas o traerlas de tu DB)
  const actividades = useMemo(
    () => [
      { id: "hincado",     nombre: "Hincado",     tarifa: 75 },
      { id: "estructura",  nombre: "Estructura",  tarifa: 100 },
      { id: "panelado",    nombre: "Panelado",    tarifa: 60 },
      { id: "corte_alto",  nombre: "Corte Alto",  tarifa: 80 },
      { id: "corte_bajo",  nombre: "Corte Bajo",  tarifa: 55 },
      { id: "pull_out",    nombre: "Pull Out",    tarifa: 120 },
      { id: "perforacion", nombre: "Perforación", tarifa: 95 },
    ],
    []
  );

  const fechas = useMemo(
    () => ["lun, 21 jul", "mar, 22 jul", "mié, 23 jul", "jue, 24 jul", "vie, 25 jul"],
    []
  );

  // Estado base: cantidades por actividad/fecha
  const [cantidades, setCantidades] = useState(() => {
    const base = {};
    for (const a of actividades) {
      base[a.id] = {};
      for (const f of fechas) base[a.id][f] = 0;
    }
    return base;
  });

  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Total por actividad / día
  const totalCelda = (actId, fecha) => {
    const act = actividades.find((a) => a.id === actId);
    const cant = Number(cantidades[actId]?.[fecha] || 0);
    return cant * (act?.tarifa || 0);
  };

  // Totales por fila y columna
  const totalFilaQ = (actId) =>
    fechas.reduce((acc, f) => acc + totalCelda(actId, f), 0);

  const totalColCant = (fecha) =>
    actividades.reduce((acc, a) => acc + Number(cantidades[a.id]?.[fecha] || 0), 0);

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

  // Guardar (simula subida 2s)
  const onGuardar = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // TODO: reemplazar por tu llamada real a Supabase / API
      await new Promise((r) => setTimeout(r, 2000));
      setEdit(false);
    } finally {
      setSaving(false);
    }
  };

  // Enter para guardar
  const onKeyDownInput = (e) => {
    if (e.key === "Enter") onGuardar();
  };

  return (
    <div className="table-excel mt-6">
      {/* Overlay de guardado a pantalla completa */}
      {saving && (
        <div className="saving-overlay">
          <div className="loader"></div>
          <div className="saving-text">Guardando…</div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="flex items-center justify-between -mt-4 mb-0">
          <div className="text-sm text-gray-600">
            {saving ? "• guardando…" : ""}
          </div>

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

      <div className="scroll-x">
        <table>
          <thead>
            <tr>
              <th className="st-actividad">PRODUCCIÓN</th>
              <th className="st-dinero">Dinero<br />GANADO</th>
              <th className="st-trabajo">Trabajo<br />HECHO</th>
              {fechas.map((f) => (
                <th key={f} colSpan={2}>{f}</th>
              ))}
            </tr>
            <tr>
              <th className="st-actividad"></th>
              <th className="st-dinero"></th>
              <th className="st-trabajo"></th>
              {fechas.map((_, i) => (
                <React.Fragment key={i}>
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
                  {fechas.reduce((acc, f) => acc + Number(cantidades[a.id]?.[f] || 0), 0)}
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

            {/* Totales por columna/fecha */}
            <tr className="row-total">
              <td className="st-actividad">TOTAL</td>
              <td className="st-dinero td-center">{GTQ(totalGeneralQ())}</td>
              <td className="st-trabajo td-center">
                {fechas.reduce((acc, f) => acc + totalColCant(f), 0)}
              </td>
              {fechas.map((f) => (
                <React.Fragment key={`tot-${f}`}>
                  <td className="td-center">{totalColCant(f)}</td>
                  <td className="td-center">{GTQ(totalColQ(f))}</td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
