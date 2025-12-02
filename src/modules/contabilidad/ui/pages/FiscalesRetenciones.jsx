// src/modules/contabilidad/ui/pages/FiscalesRetenciones.jsx
// -----------------------------------------------------------------------------
// Vista para gestionar retenciones practicadas y por enterar.
// -----------------------------------------------------------------------------

import React from "react";

export default function FiscalesRetenciones() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Declaraciones Fiscales · Retenciones</h1>
      <p className="text-sm text-slate-600">
        Controla retenciones realizadas y genera los reportes necesarios para su declaración.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá el formulario/listado de retenciones.
      </div>
    </div>
  );
}
