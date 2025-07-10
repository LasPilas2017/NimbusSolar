import React from "react";

export default function SubcategoriasGastos({ subcategorias }) {
  return (
    <div className="ml-8 mt-2 space-y-2">
      {subcategorias.map((sub, subIdx) => (
        <div
          key={subIdx}
          className="flex items-center gap-3 text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2 shadow-sm"
        >
          <span className="w-24">{sub.nombre}</span>
          <span className="font-semibold w-24 text-gray-800">
            Q{Number(sub.monto || 0).toLocaleString()}
          </span>
          <span className="w-12 text-gray-600">{sub.porcentaje || 0}%</span>
          <div className="relative flex-1 bg-gray-300 h-2 rounded-full">
            <div
              className="bg-purple-400 h-2 rounded-full"
              style={{ width: `${sub.porcentaje || 0}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
