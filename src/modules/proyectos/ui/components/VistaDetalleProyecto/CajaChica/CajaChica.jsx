import React from "react";
export default function CajaChica({ quincenaSeleccionada }) {
  return (
    <div className="p-4 rounded-2xl bg-white/70 shadow">
      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        Caja Chica {quincenaSeleccionada ? `– ${quincenaSeleccionada}` : "(Resumen General)"}
      </h2>
      <p className="text-slate-600">Próximamente: panel de caja chica.</p>
    </div>
  );
}
