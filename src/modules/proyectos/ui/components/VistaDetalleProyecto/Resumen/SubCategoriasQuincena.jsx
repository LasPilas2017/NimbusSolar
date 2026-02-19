import React from "react";

export default function SubCategoriasQuincena({
  items = [
    { nombre: "Planilla", total: 18000 },
    { nombre: "Combustible", total: 12000 },
    { nombre: "Repuestos", total: 8000 },
    { nombre: "Viáticos", total: 3000 },
  ],
}) {
  const fmtQ = (n) => `Q${Number(n || 0).toLocaleString("es-GT")}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((it, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 shadow-inner ring-1 ring-slate-200/60"
        >
          <span className="text-slate-700 font-medium truncate">{it.nombre}</span>
          <span className="font-semibold text-slate-900">{fmtQ(it.total)}</span>
        </div>
      ))}
    </div>
  );
}
