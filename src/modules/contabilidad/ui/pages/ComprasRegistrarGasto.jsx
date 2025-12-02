// src/modules/contabilidad/ui/pages/ComprasRegistrarGasto.jsx
// -----------------------------------------------------------------------------
// Pantalla para registrar gastos operativos (combustible, viaticos, repuestos).
// Aqui se agregara un formulario conectado a casos de uso e infra.
// -----------------------------------------------------------------------------

import React from "react";

export default function ComprasRegistrarGasto() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Compras y Gastos · Registrar gasto</h1>
      <p className="text-sm text-slate-600">
        Aquí se capturará un nuevo gasto con su categoría, proveedor y comprobante.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá el formulario para registrar gastos.
      </div>
      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá un resumen del gasto (IVA, total, adjuntos).
      </div>
    </div>
  );
}
