// src/modules/contabilidad/ui/pages/ActivosBajasContables.jsx
// -----------------------------------------------------------------------------
// Registro de bajas contables de activos, con causas y comprobantes.
// -----------------------------------------------------------------------------

import React from "react";

export default function ActivosBajasContables() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Activos Fijos · Bajas contables</h1>
      <p className="text-sm text-slate-600">
        Administra las bajas de activos (venta, siniestro, obsolescencia) y sus comprobantes.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá el formulario/tabla de bajas contables.
      </div>
    </div>
  );
}
