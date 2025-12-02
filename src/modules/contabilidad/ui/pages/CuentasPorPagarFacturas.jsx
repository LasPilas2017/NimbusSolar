// src/modules/contabilidad/ui/pages/CuentasPorPagarFacturas.jsx
// -----------------------------------------------------------------------------
// Listado de facturas por pagar a proveedores. Incluirá estados, vencimientos
// y enlaces a pagos.
// -----------------------------------------------------------------------------

import React from "react";

export default function CuentasPorPagarFacturas() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Cuentas por Pagar · Facturas por pagar</h1>
      <p className="text-sm text-slate-600">
        Monitorea las facturas pendientes de pago, fechas de vencimiento y proveedores.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla de facturas por pagar.
      </div>
    </div>
  );
}
