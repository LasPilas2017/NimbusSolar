// src/modules/contabilidad/ui/pages/ConfiguracionContable.jsx
// -----------------------------------------------------------------------------
// Espacio para configurar parametros contables: catalogo de cuentas, reglas de
// IVA, retenciones y preferencias generales. Solo muestra estructura base.
// -----------------------------------------------------------------------------

import React from "react";

export default function ConfiguracionContable() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-slate-800">Configuracion Contable</h2>
      <p className="text-sm text-slate-600">
        Aqui se administraran el catalogo de cuentas, parametros de IVA y demas
        ajustes contables del sistema.
      </p>

      {/* Placeholder de formularios de configuracion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Formulario de catalogo de cuentas pendiente
        </div>
        <div className="h-32 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Parametros de IVA pendientes
        </div>
      </div>
    </div>
  );
}
