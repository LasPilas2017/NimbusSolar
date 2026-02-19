import React from "react";

export default function SubcategoriasGastos({ subcategorias }) {
  return (
    <div className="ml-8 mt-2 space-y-2">
      {subcategorias.map((sub, subIdx) => (
        <div
          key={subIdx}
          className="flex items-center gap-3 text-sm text-red-800 bg-red-50 rounded-lg px-3 py-2 shadow-sm"
        >
          <span className="w-24">{sub.nombre}</span>
          <span className="font-semibold w-24">
            Q{Number(sub.monto || 0).toLocaleString()}
          </span>
          <span className="w-12">{sub.porcentaje || 0}%</span>
          <div className="relative flex-1 bg-red-200 h-2 rounded-full">
            <div
              className="bg-red-400 h-2 rounded-full"
              style={{ width: `${sub.porcentaje || 0}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}