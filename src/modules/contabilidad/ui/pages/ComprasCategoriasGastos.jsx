// src/modules/contabilidad/ui/pages/ComprasCategoriasGastos.jsx
// -----------------------------------------------------------------------------
// Configuración de categorías de gasto (combustible, viáticos, repuestos, etc.).
// Permitirá crear/editar categorías y asociarlas a reportes.
// -----------------------------------------------------------------------------

import React from "react";

export default function ComprasCategoriasGastos() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Compras y Gastos · Categorías de gastos</h1>
      <p className="text-sm text-slate-600">
        Define y administra las categorías de gasto para clasificación y reportes.
      </p>

      <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm text-slate-400">
        Aquí irá el formulario/listado de categorías.
      </div>
    </div>
  );
}
