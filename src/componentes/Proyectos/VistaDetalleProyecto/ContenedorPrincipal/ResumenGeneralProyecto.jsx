// src/componentes/Proyectos/VistaDetalleProyecto/ContenedorPrincipal/ResumenGeneralProyecto.jsx
import React from "react";
import SubcategoriasGastos from "./SubcategoriasGastos";

const fmtQ = (n) => `Q${Number(n || 0).toLocaleString("es-GT")}`;
const clamp = (n) => Math.max(0, Math.min(100, Number(n || 0)));

export default function ResumenGeneralProyecto({
  resumen = [],                    // [{ nombre: "Utilidad"|"Producción"|"Gastos", monto, porcentaje }]
  subcategoriasGastos = [],        // array de subcats para "Gastos"
  mostrarSubcategorias = false,
  setMostrarSubcategorias = () => {},
}) {
  const colorBarra = (nombre) => {
    if (nombre === "Utilidad") return "bg-green-400";
    if (nombre === "Producción") return "bg-blue-500";
    if (nombre === "Gastos") return "bg-red-400";
    return "bg-gray-400";
    };

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-8">
      <div className="space-y-4">
        {resumen.map((item, idx) => {
          const pct = clamp(item.porcentaje);
          const esGastos = item.nombre === "Gastos";

          const Row = (
            <div className="bg-gray-50 px-4 py-3 rounded-xl shadow-inner flex items-center gap-4 flex-wrap sm:flex-nowrap hover:bg-gray-100 transition">
              <span className="font-medium text-gray-700 w-24 min-w-[80px]">
                {item.nombre}
              </span>

              <span className="font-bold text-gray-900 w-28 min-w-[100px]">
                {fmtQ(item.monto)}
              </span>

              <span className="text-sm text-gray-600 w-16 min-w-[60px] text-right">
                {pct}%
              </span>

              {/* Barra cuadrada */}
              <div className="relative flex-1 bg-gray-200 rounded-none h-4">
                <div
                  className={`h-4 rounded-none transition-all ${colorBarra(item.nombre)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );

          return (
            <div key={idx}>
              {/* Solo Gastos es expandible para mostrar subcategorías */}
              {esGastos ? (
                <button
                  type="button"
                  onClick={() => setMostrarSubcategorias(!mostrarSubcategorias)}
                  aria-expanded={mostrarSubcategorias}
                  className="w-full text-left rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300"
                >
                  {Row}
                </button>
              ) : (
                Row
              )}

              {esGastos && mostrarSubcategorias && (
                <div className="mt-3">
                  <SubcategoriasGastos subcategorias={subcategoriasGastos} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
