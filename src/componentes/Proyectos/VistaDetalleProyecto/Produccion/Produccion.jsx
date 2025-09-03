import React from "react";
import "../../../EstilosCSS/BarradeProgreso.css";
import ProduccionEstiloExcel from "./ProduccionEstiloExcel";

function Barra({ label, amount, percent, tipo }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-gray-700 font-semibold">{label}</span>
        <span className="text-gray-900 font-bold">Q{amount.toLocaleString("es-GT")}</span>
      </div>

      <div className="progress-container">
        <div className={`progress-bar ${tipo}`} style={{ "--percent": `${percent}%` }} />
        <div className="progress-text">{percent}%</div>
        <div className="particles">
          <div className="particle" /><div className="particle" />
          <div className="particle" /><div className="particle" />
          <div className="particle" />
        </div>
      </div>
    </div>
  );
}

export default function Produccion() {
  const datos = [
    { label: "Utilidad",    amount: 5000,  percent: 85, tipo: "utilidad"  },
    { label: "Producción",  amount: 10000, percent: 50, tipo: "produccion"},
    { label: "Gastos",      amount: 3500,  percent: 70, tipo: "gastos"    },
  ];

  return (
    <div className="w-full">
      {datos.map((d) => (<Barra key={d.label} {...d} />))}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white/70 p-4">
        {/* ⬇️ Tabla estilo Excel usando los mismos datos */}
        <ProduccionEstiloExcel datos={datos} />
      </div>
    </div>
  );
}
