// src/modules/contabilidad/ui/pages/BandejaFacturas.jsx
// -----------------------------------------------------------------------------
// Lista las facturas enviadas desde ventas hacia contabilidad. Aqui se
// integrara la tabla con filtros y acciones (revisar, aprobar, rechazar).
// Por ahora es un esqueleto sin logica de negocio.
// -----------------------------------------------------------------------------

import React from "react";

export default function BandejaFacturas() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-slate-800">Bandeja de facturas</h2>
      <p className="text-sm text-slate-600">
        Aqui se mostraran las facturas recibidas desde ventas con su estado,
        observaciones y acciones disponibles.
      </p>

      {/* Placeholder de tabla de facturas */}
      <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400">
        Tabla de facturas pendiente de implementar
      </div>
    </div>
  );
}
