// src/modules/vendedor/ui/pages/RESULTADOS.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Pantalla "Resultados" del sistema del vendedor.
// Muestra filtros (agente, año, mes), un resumen global, un resumen por vendedor
// y un gráfico de tendencias.
//
// - CAPA: UI (React)
// - DATOS: actualmente usa datos DEMO en memoria.
//   Más adelante se puede conectar a Supabase (por ejemplo tablas
//   "prospectos", "ventas", etc.) a través de casos de uso en application.
// -----------------------------------------------------------------------------

import React from "react";
import * as Recharts from "recharts";

const {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} = Recharts;

export default function RESULTADOS() {
  // Datos visuales de ejemplo
  const demo = [
    { mes: "Enero", prospectos: 10, cierres: 5, ventas: 2000 },
    { mes: "Febrero", prospectos: 8, cierres: 4, ventas: 1800 },
    { mes: "Marzo", prospectos: 12, cierres: 6, ventas: 2500 },
    { mes: "Abril", prospectos: 9, cierres: 3, ventas: 1700 },
    { mes: "Mayo", prospectos: 15, cierres: 7, ventas: 3100 },
    { mes: "Junio", prospectos: 13, cierres: 5, ventas: 2800 },
  ];

  const totalProspectos = demo.reduce((a, r) => a + r.prospectos, 0);
  const totalCierres = demo.reduce((a, r) => a + r.cierres, 0);
  const totalVentas = demo.reduce((a, r) => a + r.ventas, 0);

  const fmtQ = (n) =>
    `Q ${Number(n).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90">
      <div className="w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex flex-col">
        {/* ENCABEZADO + FILTROS */}
        <div className="px-5 sm:px-6 md:px-8 py-5 sm:py-6 border-b border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                Evaluación de Agentes y Vendedores
              </h1>
              <p className="text-sm text-white/70 mt-1">
                Resumen mensual de prospectos, cierres y ventas.
              </p>
            </div>

            {/* filtros */}
            <div className="flex flex-wrap gap-3 justify-start md:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/80">
                  Agente:
                </span>
                <select className="rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70">
                  <option className="bg-[#0b1320]">Seleccionar…</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/80">
                  Año:
                </span>
                <select className="rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70">
                  {[2025, 2024, 2023].map((y) => (
                    <option key={y} className="bg-[#0b1320]">
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/80">
                  Mes:
                </span>
                <select className="rounded-lg bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70">
                  {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"].map(
                    (m) => (
                      <option key={m} className="bg-[#0b1320]">
                        {m}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* tarjetas resumen */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Prospectos</p>
              <p className="text-2xl font-semibold text-emerald-300">
                {totalProspectos}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Cierres</p>
              <p className="text-2xl font-semibold text-cyan-300">
                {totalCierres}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Ventas</p>
              <p className="text-2xl font-semibold text-amber-300">
                {fmtQ(totalVentas)}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 px-5 sm:px-6 md:px-8 py-4 sm:py-5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-full">
            {/* ANÁLISIS GLOBAL */}
            <div className="lg:col-span-4 min-w-0 h-full">
              <div className="h-full rounded-2xl bg-slate-950/60 border border-white/10 shadow-inner overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-white/70">
                  Análisis global
                </div>
                <div className="grid grid-cols-4 text-[11px] sm:text-xs text-white/80 text-center">
                  <div className="py-2 border-b border-white/10">Mes</div>
                  <div className="py-2 border-b border-white/10">
                    Prospectos
                  </div>
                  <div className="py-2 border-b border-white/10">Cierres</div>
                  <div className="py-2 border-b border-white/10">Ventas</div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {demo.map((r, idx) => (
                    <div
                      key={r.mes}
                      className={`grid grid-cols-4 text-[11px] sm:text-xs text-center ${
                        idx % 2 === 0
                          ? "bg-slate-900/40"
                          : "bg-slate-800/40"
                      } border-b border-slate-800/70`}
                    >
                      <div className="py-1.5 text-white/90">{r.mes}</div>
                      <div className="py-1.5 text-emerald-200">
                        {r.prospectos}
                      </div>
                      <div className="py-1.5 text-cyan-200">{r.cierres}</div>
                      <div className="py-1.5 text-amber-200">
                        {fmtQ(r.ventas)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ANÁLISIS DE VENDEDOR (placeholder) */}
            <div className="lg:col-span-3 min-w-0 h-full">
              <div className="h-full rounded-2xl bg-slate-950/60 border border-white/10 shadow-inner overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-white/70">
                  Análisis de vendedor
                </div>
                <div className="flex-1 text-sm divide-y divide-slate-800/80 text-white/80">
                  <RowStat label="Prospectos" value="0" />
                  <RowStat label="Cierres" value="0" />
                  <RowStat label="Ventas" value="Q 0.00" />
                  <RowStat label="Conversión" value="0%" />
                </div>
              </div>
            </div>

            {/* GRÁFICO */}
            <div className="lg:col-span-5 min-w-0 h-full">
              <div className="h-full rounded-2xl bg-slate-950/60 border border-white/10 shadow-inner overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-white/70">
                  Gráfico de ventas
                </div>
                <div className="flex-1 min-h-[240px] sm:min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={demo}
                      margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                    >
                      <CartesianGrid
                        stroke="rgba(148,163,184,0.35)"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                        axisLine={{ stroke: "rgba(148,163,184,0.6)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#e5e7eb" }}
                        axisLine={{ stroke: "rgba(148,163,184,0.6)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          border: "1px solid rgba(148,163,184,0.5)",
                          borderRadius: 8,
                          color: "#e5e7eb",
                          fontSize: 11,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="prospectos"
                        stroke="#fb7185"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cierres"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ventas"
                        stroke="#22c55e"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}

function RowStat({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-white/70">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
