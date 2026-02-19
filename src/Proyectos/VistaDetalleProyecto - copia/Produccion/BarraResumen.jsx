import React from "react";

export default function BarraResumen({ data = [] }) {
  const lista = Array.isArray(data) ? data : [];
  return (
    <div className="space-y-4">
      {lista.map((item, i) => (
        <div key={item?.nombre ?? i} className="bg-white/70 rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-700 font-semibold">{item?.nombre ?? "—"}</span>
            <span className="font-bold">Q{Number(item?.monto ?? 0).toLocaleString("es-GT")}</span>
          </div>
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-4 rounded-full"
              style={{ width: `${Math.min(Math.max(Number(item?.porcentaje ?? 0), 0), 100)}%` }}
            />
          </div>
          <div className="text-right text-slate-500 text-sm mt-1">
            {Number(item?.porcentaje ?? 0)}%
          </div>
        </div>
      ))}
    </div>
  );
}
