// src/modules/contabilidad/ui/pages/ActivosListado.jsx
// -----------------------------------------------------------------------------
// Listado general de activos fijos con su estado, ubicación y responsable.
// -----------------------------------------------------------------------------

import React from "react";

export default function ActivosListado() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Activos Fijos · Listado de activos</h1>
      <p className="text-sm text-slate-600">
        Visualiza los activos registrados, su valor, vida útil y ubicación.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla de activos fijos.
      </div>
    </div>
  );
}
