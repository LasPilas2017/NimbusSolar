// src/modules/contabilidad/ui/pages/AuditoriaBitacoraGeneral.jsx
// -----------------------------------------------------------------------------
// Bitácora general de eventos en el sistema contable (altas, ediciones, accesos).
// -----------------------------------------------------------------------------

import React from "react";

export default function AuditoriaBitacoraGeneral() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Auditoría · Bitácora general</h1>
      <p className="text-sm text-slate-600">
        Registra y consulta los eventos clave del sistema contable.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla de bitácora con filtros por fecha/usuario.
      </div>
    </div>
  );
}
