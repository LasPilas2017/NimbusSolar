// src/modules/contabilidad/ui/pages/CentroCostosGastosProyecto.jsx
// -----------------------------------------------------------------------------
// Vista para analizar gastos por proyecto o centro de costos.
// -----------------------------------------------------------------------------

import React from "react";

export default function CentroCostosGastosProyecto() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Centro de Costos / Proyectos · Gastos por proyecto</h1>
      <p className="text-sm text-slate-600">
        Revisa los gastos asignados a cada proyecto o centro de costos.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla/resumen de gastos por proyecto.
      </div>
    </div>
  );
}
