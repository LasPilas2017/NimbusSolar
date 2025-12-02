// src/modules/contabilidad/ui/pages/TableroContable.jsx
// -----------------------------------------------------------------------------
// Pagina principal del sistema contable. Aqui se mostraran tarjetas de resumen
// para facturas, bancos, cuentas por cobrar, IVA y otros indicadores clave.
// Este componente solo define la estructura basica y no depende de infra.
// -----------------------------------------------------------------------------

import React from "react";

export default function TableroContable() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-slate-800">Tablero Contable</h2>
      <p className="text-sm text-slate-600">
        Aqui se colocaran las tarjetas de resumen con indicadores clave del area
        contable (facturas, bancos, cuentas por cobrar, IVA, retenciones, etc.).
      </p>
      {/* Futuro: grid de tarjetas con totales, tendencias y alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Tarjeta de resumen pendiente
        </div>
        <div className="h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Tarjeta de bancos pendiente
        </div>
        <div className="h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Tarjeta de cuentas por cobrar pendiente
        </div>
      </div>
    </div>
  );
}
