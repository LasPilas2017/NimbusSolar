// src/modules/contabilidad/ui/pages/ActivosRegistrar.jsx
// -----------------------------------------------------------------------------
// Formulario para registrar un nuevo activo fijo y asignar centro de costos.
// -----------------------------------------------------------------------------

import React from "react";

export default function ActivosRegistrar() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Activos Fijos · Registrar activo</h1>
      <p className="text-sm text-slate-600">
        Ingresa datos de un activo (costo, vida útil, ubicación, responsable).
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá el formulario de registro de activos.
      </div>
    </div>
  );
}
