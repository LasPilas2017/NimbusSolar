// src/modules/contabilidad/ui/pages/ComprasHistorialGastos.jsx
// -----------------------------------------------------------------------------
// Listado historico de gastos registrados. Incluirá filtros por fecha, proveedor
// y categoría, además de exportaciones futuras.
// -----------------------------------------------------------------------------

import React from "react";

export default function ComprasHistorialGastos() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Compras y Gastos · Historial de gastos</h1>
      <p className="text-sm text-slate-600">
        Visualiza y filtra los gastos registrados, con estados y comprobantes asociados.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla con el historial de gastos y filtros.
      </div>
    </div>
  );
}
