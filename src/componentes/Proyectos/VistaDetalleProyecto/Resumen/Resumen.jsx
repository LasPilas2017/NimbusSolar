import React from "react";
import SubcategoriasGastos from "../ContenedorPrincipal/SubcategoriasGastos";
import TablaTrabajos from "./TablaTrabajos";

export default function Resumen({
  quincena,
  resumen = [],
  subcategoriasGastos = [],
  trabajos = [],
}) {
  const fmtQ = (n) => `Q${Number(n || 0).toLocaleString("es-GT")}`;
  const clamp = (n) => Math.max(0, Math.min(100, Number(n || 0)));

  const colorMap = {
    Utilidad: "#34D399",   // verde
    Producción: "#3B82F6", // azul
    Gastos: "#EF4444",     // rojo
  };

  return (
    <section className="mt-6 space-y-6">
      {/* Título local de la sección */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Resumen — {quincena || "Sin quincena"}
        </h2>
        <p className="text-slate-500 text-sm">
          Indicadores y detalle de la quincena seleccionada
        </p>
      </div>

      {/* KPIs / Barras */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-5 space-y-4">
        {resumen.map((item, idx) => {
          const pct = clamp(item.porcentaje);
          const color = colorMap[item.nombre] || "#9CA3AF"; // gris

          return (
            <div
              key={idx}
              className="bg-slate-50 px-4 py-3 rounded-2xl shadow-inner flex items-center gap-4 flex-wrap sm:flex-nowrap"
            >
              <span className="font-semibold text-slate-700 w-28 min-w-[92px]">
                {item.nombre}
              </span>

              <span className="font-extrabold text-slate-900 w-32 min-w-[108px]">
                {fmtQ(item.monto)}
              </span>

              <span className="text-sm text-slate-600 w-16 min-w-[60px] text-right">
                {pct}%
              </span>

              <div className="relative flex-1">
                <div className="h-4 w-full bg-slate-200 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-1px_0_rgba(0,0,0,.03)]" />
                <div
                  className="absolute left-0 top-0 h-4 rounded-full transition-all duration-500 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-1px_0_rgba(0,0,0,.03)]"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subcategorías de gastos (si hay) */}
      {Array.isArray(subcategoriasGastos) && subcategoriasGastos.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Subcategorías de Gastos
          </h3>
          <SubcategoriasGastos subcategorias={subcategoriasGastos} />
        </div>
      )}

      {/* Tabla de trabajos (si hay) */}
      {Array.isArray(trabajos) && trabajos.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Trabajos a Realizar
          </h3>
          <TablaTrabajos filas={trabajos} />
        </div>
      )}
    </section>
  );
}
