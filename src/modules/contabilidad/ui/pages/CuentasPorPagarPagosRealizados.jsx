// src/modules/contabilidad/ui/pages/CuentasPorPagarPagosRealizados.jsx
// -----------------------------------------------------------------------------
// Registro de pagos realizados a proveedores. Permitirá ver comprobantes y
// cruzar con facturas.
// -----------------------------------------------------------------------------

import React from "react";

export default function CuentasPorPagarPagosRealizados() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Cuentas por Pagar · Pagos realizados</h1>
      <p className="text-sm text-slate-600">
        Consulta pagos efectuados, comprobantes y facturas conciliadas.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla de pagos realizados y sus comprobantes.
      </div>
    </div>
  );
}
