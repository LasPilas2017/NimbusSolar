// src/modules/contabilidad/ui/pages/ActivosDepreciacionMensual.jsx
// -----------------------------------------------------------------------------
// Vista para calcular y revisar la depreciación mensual de los activos.
// -----------------------------------------------------------------------------

import React from "react";

export default function ActivosDepreciacionMensual() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Activos Fijos · Depreciación mensual</h1>
      <p className="text-sm text-slate-600">
        Calcula y valida la depreciación de los activos del mes en curso.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá el cálculo/tabla de depreciación mensual.
      </div>
    </div>
  );
}
