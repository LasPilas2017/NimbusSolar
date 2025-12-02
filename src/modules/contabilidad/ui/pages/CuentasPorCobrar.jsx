// src/modules/contabilidad/ui/pages/CuentasPorCobrar.jsx
// -----------------------------------------------------------------------------
// Pagina para controlar las facturas a credito y su estado (todas, proximas a
// vencer, vencidas). Aqui se mostraran listados, filtros y acciones de cobro.
// Solo incluye estructura basica y comentarios orientativos.
// -----------------------------------------------------------------------------

import React from "react";

export default function CuentasPorCobrar() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-slate-800">Cuentas por Cobrar</h2>
      <p className="text-sm text-slate-600">
        Aqui se gestionaran las facturas a credito: proximas a vencer, vencidas
        y historico de cobranzas.
      </p>

      {/* Placeholder de tablero de cuentas por cobrar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Resumen de proximas a vencer
        </div>
        <div className="h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Resumen de vencidas
        </div>
        <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400 md:col-span-2">
          Tabla de cuentas por cobrar pendiente
        </div>
      </div>
    </div>
  );
}
