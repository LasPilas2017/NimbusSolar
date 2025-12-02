// src/modules/contabilidad/ui/pages/CuentasPorPagarVencidas.jsx
// -----------------------------------------------------------------------------
// Vista de facturas vencidas. Permitirá priorizar pagos y registrar gestiones
// con proveedores.
// -----------------------------------------------------------------------------

import React from "react";

export default function CuentasPorPagarVencidas() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Cuentas por Pagar · Facturas vencidas</h1>
      <p className="text-sm text-slate-600">
        Controla las facturas vencidas y define próximas acciones de pago.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla de facturas vencidas.
      </div>
    </div>
  );
}
