// src/modules/contabilidad/ui/pages/EstadosFinancieros.jsx
// -----------------------------------------------------------------------------
// Vista orientada a reportes financieros (balanza, estado de resultados, flujo
// de efectivo). Aqui se agregaran filtros por rango de fechas y descargas.
// Actualmente es un esqueleto sin integracion con la capa infra.
// -----------------------------------------------------------------------------

import React from "react";

export default function EstadosFinancieros() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-slate-800">Estados Financieros</h2>
      <p className="text-sm text-slate-600">
        Aqui se mostraran reportes como balanza, estado de resultados y flujo de
        efectivo con opciones de exportar.
      </p>

      {/* Placeholder de reportes financieros */}
      <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400">
        Widgets y tablas de reportes pendientes
      </div>
    </div>
  );
}
