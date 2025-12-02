// src/modules/contabilidad/ui/pages/FiscalesIVA.jsx
// -----------------------------------------------------------------------------
// Sección para preparar y consultar declaraciones de IVA.
// -----------------------------------------------------------------------------

import React from "react";

export default function FiscalesIVA() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Declaraciones Fiscales · IVA</h1>
      <p className="text-sm text-slate-600">
        Aquí se prepararán los datos de IVA débito/crédito para la declaración.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá el cálculo y formulario de declaración de IVA.
      </div>
    </div>
  );
}
