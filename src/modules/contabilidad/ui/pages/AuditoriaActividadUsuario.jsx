// src/modules/contabilidad/ui/pages/AuditoriaActividadUsuario.jsx
// -----------------------------------------------------------------------------
// Seguimiento de actividad por usuario (ingresos, cambios, descargas).
// -----------------------------------------------------------------------------

import React from "react";

export default function AuditoriaActividadUsuario() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Auditoría · Actividad por usuario</h1>
      <p className="text-sm text-slate-600">
        Analiza la actividad individual por usuario dentro del sistema contable.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá la tabla/reportes de actividad por usuario.
      </div>
    </div>
  );
}
