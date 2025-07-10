import React from "react";
import FilaResumen from "./FilaResumen";
import SubcategoriasGastos from "./SubcategoriasGastos";

export default function ResumenGeneralProyecto({
  resumen,
  subcategoriasGastos,
  mostrarSubcategorias,
  setMostrarSubcategorias,
  titulo = "Resumen General del Proyecto",
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-8">
      <h2 className="text-lg font-semibold text-center mb-4 text-gray-700">
        {titulo}
      </h2>

      <div className="space-y-4">
        {resumen.map((item, idx) => (
          <div key={idx}>
            <div
              onClick={() =>
                item.nombre === "Gastos" &&
                setMostrarSubcategorias(!mostrarSubcategorias)
              }
              className="bg-gray-50 px-4 py-3 rounded-xl shadow-inner flex items-center gap-4 flex-wrap sm:flex-nowrap cursor-pointer hover:bg-gray-100 transition"
            >
              <span className="font-medium text-gray-700 w-24 min-w-[80px]">
                {item.nombre}
              </span>

              <span className="font-bold text-gray-800 w-28 min-w-[100px]">
                Q{Number(item.monto || 0).toLocaleString()}
              </span>

              <span className="text-sm text-gray-600 w-16 min-w-[60px] text-right">
                {item.porcentaje || 0}%
              </span>

              <div className="relative flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-500 h-4 rounded-full transition-all"
                  style={{ width: `${item.porcentaje || 0}%` }}
                ></div>
              </div>
            </div>

            {item.nombre === "Gastos" && mostrarSubcategorias && (
              <SubcategoriasGastos subcategorias={subcategoriasGastos} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
