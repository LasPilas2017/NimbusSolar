import React from "react";

export default function FilaResumen({ item, isGastos, toggleSub }) {
  return (
    <div
      onClick={isGastos ? toggleSub : undefined}
      className={`bg-gray-50 px-4 py-3 rounded-xl shadow-inner flex items-center gap-4 flex-wrap sm:flex-nowrap ${
        isGastos ? "cursor-pointer hover:bg-gray-100" : ""
      }`}
    >
      <span className="font-medium text-gray-700 w-24 min-w-[80px]">
        {item.nombre}
      </span>
      <span className="font-bold text-gray-800 w-28 min-w-[100px]">
        Q{item.monto.toLocaleString()}
      </span>
      <span className="text-sm text-gray-600 w-16 min-w-[60px] text-right">
        {item.porcentaje}%
      </span>
      <div className="relative flex-1 bg-gray-200 rounded-full h-4">
        <div
          className="bg-purple-500 h-4 rounded-full transition-all"
          style={{ width: `${item.porcentaje}%` }}
        ></div>
      </div>
    </div>
  );
}
