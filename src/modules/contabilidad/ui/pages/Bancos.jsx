// src/modules/contabilidad/ui/pages/Bancos.jsx
// -----------------------------------------------------------------------------
// Vista para registrar pagos y conciliaciones bancarias. Aqui se integraran
// formularios para pagos, importacion de extractos y conciliacion automatica.
// Este esqueleto se mantiene sin logica de negocio para no acoplar capas.
// -----------------------------------------------------------------------------

import React from "react";

export default function Bancos() {
  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-slate-800">Bancos</h2>
      <p className="text-sm text-slate-600">
        En esta vista se registraran pagos, transferencias y conciliaciones
        bancarias contra las facturas o cuentas por cobrar.
      </p>

      {/* Placeholder de widgets de bancos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Formulario rapido de pago
        </div>
        <div className="h-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
          Panel de conciliacion pendiente
        </div>
      </div>
    </div>
  );
}
