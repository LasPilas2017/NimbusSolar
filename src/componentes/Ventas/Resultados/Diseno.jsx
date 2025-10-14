// src/componentes/Ventas/Resultados/Diseno.jsx
import React from "react";
import * as Recharts from "recharts";

const fmtMoneda = (n) =>
  n?.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const demo = [
  { mes: "Enero", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Febrero", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Marzo", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Abril", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Mayo", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Junio", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Julio", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Agosto", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Septiembre", prospectos: 1, cierres: 1, ventas: 4000 },
  { mes: "Octubre", prospectos: 2, cierres: 2, ventas: 8000 },
  { mes: "Noviembre", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Diciembre", prospectos: 0, cierres: 0, ventas: 0 },
];

export default function Diseno({ user, rolUsuario }) {
  const [anio, setAnio] = React.useState(new Date().getFullYear());
  const [agente, setAgente] = React.useState("Jorge Mauricio");

  const totalProspectos = demo.reduce((a, r) => a + r.prospectos, 0);
  const totalCierres = demo.reduce((a, r) => a + r.cierres, 0);
  const totalVentas = demo.reduce((a, r) => a + r.ventas, 0);
  const conversion = totalProspectos ? (totalCierres / totalProspectos) : 0;

  const {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  } = Recharts;

  return (
    <div className="w-full min-h-screen px-6 pb-8">
      <div className="w-full bg-gray-800 text-white font-semibold text-lg tracking-wide px-4 py-2 mb-4">
        Evaluación de Agentes y Vendedores
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="min-w-[110px] text-sm font-semibold bg-gray-200 text-gray-700 px-4 py-2">
            Año
          </span>
          <select
            className="bg-[#e9f0f9] text-gray-800 px-4 py-2 border border-gray-500"
            value={anio}
            onChange={(e) => setAnio(parseInt(e.target.value, 10))}
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="min-w-[110px] text-sm font-semibold bg-gray-200 text-gray-700 px-4 py-2">
            Agente
          </span>
          <select
            className="bg-[#e9f0f9] text-gray-800 px-4 py-2 border border-gray-500"
            value={agente}
            onChange={(e) => setAgente(e.target.value)}
          >
            <option>Jorge Mauricio</option>
            <option>María Pérez</option>
            <option>Juan López</option>
          </select>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
 {/* === Análisis de Vendedor === */}
<div className="lg:col-span-3">
  <div className="bg-white shadow border border-gray-500">
    <div className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 border-b border-gray-500">
      Análisis de Vendedor
    </div>

    {/* Filas con línea vertical continua y altura compacta */}
    <div className="text-sm">
      {[
        ["Prospectos", totalProspectos, "text-gray-800"],
        ["Contacto", 3, "text-red-600"],
        ["Cita", 3, "text-gray-800"],
        ["Candidato", 3, "text-gray-800"],
        ["Cotización", 3, "text-gray-800"],
        ["Cierre", totalCierres, "text-gray-800"],
        ["Ventas", totalCierres, "text-gray-800"],
        ["Perdidos", 0, "text-gray-800"],
        ["% Conversión", `${(conversion * 100).toFixed(2)}%`, "text-blue-600"],
        ["Días Promedio", "3.00", "text-orange-600"],
        ["$ Ventas", fmtMoneda(totalVentas), "text-emerald-600"],
        ["$ Pérdidas", "-", "text-gray-500"],
        ["Efectividad", "100.00%", "text-gray-800"],
      ].map(([label, value, cls]) => (
        <div key={label} className="grid grid-cols-[1fr,6rem]">
          {/* Celda izquierda */}
          <div className="px-4 py-1.5 border-t border-gray-400 text-gray-700">
            {label}
          </div>
          {/* Celda derecha con línea vertical continua */}
          <div
            className={`px-4 py-1.5 border-t border-l border-gray-400 text-right font-semibold ${cls}`}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>



        {/* === Análisis Global === */}
        <div className="lg:col-span-4">
          <div className="bg-white shadow border border-gray-500 overflow-hidden">
            <div className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 border-b border-gray-500">
              Análisis Global
            </div>

            <div className="grid grid-cols-4 text-sm border-b border-gray-500">
              <div className="bg-gray-50 font-semibold px-3 py-2 border-r border-gray-400"> </div>
              <div className="bg-gray-50 font-semibold px-3 py-2 border-r border-gray-400 text-right">
                Prospectos
              </div>
              <div className="bg-gray-50 font-semibold px-3 py-2 border-r border-gray-400 text-right">
                Cierres
              </div>
              <div className="bg-gray-50 font-semibold px-3 py-2 text-right">
                Ventas
              </div>
            </div>

            <div className="text-sm">
              {demo.map((r) => (
                <div key={r.mes} className="grid grid-cols-4">
                  <div className="px-3 py-2 border-t border-gray-400 border-r">
                    {r.mes}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-400 border-r text-right">
                    {r.prospectos}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-400 border-r text-right">
                    {r.cierres}
                  </div>
                  <div className="px-3 py-2 border-t border-gray-400 text-right">
                    {fmtMoneda(r.ventas)}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-4 bg-gray-50 font-semibold border-t-2 border-gray-700">
                <div className="px-3 py-2 border-r border-gray-700">Total</div>
                <div className="px-3 py-2 border-r border-gray-700 text-right">
                  {totalProspectos}
                </div>
                <div className="px-3 py-2 border-r border-gray-700 text-right">
                  {totalCierres}
                </div>
                <div className="px-3 py-2 text-right">{fmtMoneda(totalVentas)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* === Gráfico centrado verticalmente === */}
        <div className="lg:col-span-5">
          <div className="bg-white shadow border border-gray-500 h-[460px] flex items-center">
            <div className="w-full h-[90%]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={demo}
                  margin={{ top: 10, right: 40, bottom: 10, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" allowDecimals={false} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(v) => fmtMoneda(v)}
                  />
                  <Tooltip
                    formatter={(val, name) =>
                      name === "ventas" || name === "Ventas"
                        ? fmtMoneda(val)
                        : val
                    }
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="prospectos" name="Prospectos" />
                  <Bar yAxisId="left" dataKey="cierres" name="Cierres" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ventas"
                    name="Ventas"
                    dot={false}
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
