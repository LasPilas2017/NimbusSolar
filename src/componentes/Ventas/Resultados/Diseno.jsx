// src/componentes/Ventas/Resultados/Diseno.jsx
import React from "react";
import * as Recharts from "recharts";

// Formateador Quetzales
const fmtQ = (n) =>
  (n ?? 0).toLocaleString("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  });

// Datos demo (todo en 0)
const demo = [
  { mes: "Enero", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Febrero", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Marzo", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Abril", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Mayo", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Junio", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Julio", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Agosto", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Septiembre", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Octubre", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Noviembre", prospectos: 0, cierres: 0, ventas: 0 },
  { mes: "Diciembre", prospectos: 0, cierres: 0, ventas: 0 },
];

export default function Diseno() {
  const mesesNombres = React.useMemo(
    () => [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ],
    []
  );

  const hoy = new Date();
  const mesActualNombre = mesesNombres[hoy.getMonth()];

  const [anio, setAnio] = React.useState(new Date().getFullYear());
  const [agente, setAgente] = React.useState("");
  const [modoRango, setModoRango] = React.useState(false); // false = Mes único, true = Rango
  const [mesInicio, setMesInicio] = React.useState(mesActualNombre);
  const [mesFin, setMesFin] = React.useState(mesActualNombre);

  // Toggles de series (gráfico)
  const [showProspectos, setShowProspectos] = React.useState(true);
  const [showCierres, setShowCierres] = React.useState(true);
  const [showVentas, setShowVentas] = React.useState(true);

  // Si es rango, evitar que fin < inicio (pero sin cambiar layout)
  React.useEffect(() => {
    if (!modoRango) return;
    const iIni = mesesNombres.indexOf(mesInicio);
    const iFin = mesesNombres.indexOf(mesFin);
    if (iFin < iIni) setMesFin(mesInicio);
  }, [modoRango, mesInicio, mesFin, mesesNombres]);

  const totalProspectos = demo.reduce((a, r) => a + r.prospectos, 0);
  const totalCierres = demo.reduce((a, r) => a + r.cierres, 0);
  const totalVentas = demo.reduce((a, r) => a + r.ventas, 0);
  const conversion = totalProspectos ? totalCierres / totalProspectos : 0;

  const {
    ResponsiveContainer,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
  } = Recharts;

  return (
    <div className="w-full min-h-screen px-6 pb-8">
      {/* Encabezado (título + filtros) */}
      <div className="bg-[#1E2733] text-white rounded-xl shadow px-5 py-4 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Título a la izquierda */}
          <h1 className="text-xl font-semibold">
            Evaluación de Agentes y Vendedores
          </h1>

          {/* Filtros en una sola línea */}
          <div className="bg-[#E9EAEC] rounded-xl px-4 py-3 shadow-inner flex flex-wrap items-center gap-4">
            {/* Agente */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Agente</span>
              <select
                className="rounded-lg bg-[#E9F0F9] text-gray-800 px-3 py-1 border outline-none focus:ring focus:ring-blue-200 w-[230px]"
                value={agente}
                onChange={(e) => setAgente(e.target.value)}
              >
                <option value="">Seleccionar…</option>
                <option>Jorge Mauricio</option>
                <option>María Pérez</option>
                <option>Juan López</option>
              </select>
            </div>

            {/* Año */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Año</span>
              <select
                className="rounded-lg bg-[#E9F0F9] text-gray-800 px-3 py-1 border outline-none focus:ring focus:ring-blue-200 w-[110px]"
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value, 10))}
              >
                {[2026, 2025, 2024, 2023].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Mes + Modo (en la MISMA línea, sin mover layout) */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">Meses</span>

              {/* Contenedor de selects con ancho fijo para evitar “saltos” */}
              <div className="flex items-center gap-2">
                {/* Select 1 (inicio) */}
                <select
                  className="rounded-lg bg-[#E9F0F9] text-gray-800 px-3 py-1 border outline-none focus:ring focus:ring-blue-200 w-[180px]"
                  value={mesInicio}
                  onChange={(e) => setMesInicio(e.target.value)}
                >
                  {mesesNombres.map((mes) => (
                    <option key={`inicio-${mes}`} value={mes}>{mes}</option>
                  ))}
                </select>

                {/* Separador “a” – siempre ocupa espacio (sin saltos) */}
                <span
                  className={`font-semibold w-4 text-center ${
                    modoRango ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  a
                </span>

                {/* Select 2 (fin) – SIEMPRE visible, solo se deshabilita en Mes único */}
                <select
                  disabled={!modoRango}
                  className={`rounded-lg px-3 py-1 border outline-none focus:ring w-[180px] transition
                    ${modoRango
                      ? "bg-[#E9F0F9] text-gray-800 focus:ring-blue-200"
                      : "bg-gray-100 text-gray-400 pointer-events-none"
                    }`}
                  value={mesFin}
                  onChange={(e) => setMesFin(e.target.value)}
                >
                  {mesesNombres.map((mes) => (
                    <option key={`fin-${mes}`} value={mes}>{mes}</option>
                  ))}
                </select>
              </div>

              {/* Modo (botonera) */}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm font-semibold text-gray-900">Modo</span>
                <div className="flex rounded-md overflow-hidden border">
                  <button
                    type="button"
                    onClick={() => setModoRango(false)}
                    className={`px-3 py-1 text-sm text-gray-900 ${
                      !modoRango ? "bg-white font-semibold" : "bg-gray-100"
                    } hover:bg-white`}
                  >
                    Mes único
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoRango(true)}
                    className={`px-3 py-1 text-sm text-gray-900 ${
                      modoRango ? "bg-white font-semibold" : "bg-gray-100"
                    } hover:bg-white border-l`}
                  >
                    Rango
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* === Análisis Global (a la izquierda, más angosto) === */}
        <div className="lg:col-span-4">
          <div className="bg-white shadow border border-gray-500 overflow-hidden">
            <div className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 border-b border-gray-500">
              Análisis Global
            </div>

            <div className="grid grid-cols-4 text-sm border-b border-gray-500">
              <div className="bg-gray-50 font-semibold px-3 py-1 border-r border-gray-400"></div>
              <div className="bg-gray-50 font-semibold px-3 py-1 border-r border-gray-400 text-right">Prospectos</div>
              <div className="bg-gray-50 font-semibold px-3 py-1 border-r border-gray-400 text-right">Cierres</div>
              <div className="bg-gray-50 font-semibold px-3 py-1 text-right">Ventas</div>
            </div>

            <div className="text-sm">
              {demo.map((r) => (
                <div key={r.mes} className="grid grid-cols-4">
                  <div className="px-3 py-1 border-t border-gray-400 border-r">{r.mes}</div>
                  <div className="px-3 py-1 border-t border-gray-400 border-r text-right">{r.prospectos}</div>
                  <div className="px-3 py-1 border-t border-gray-400 border-r text-right">{r.cierres}</div>
                  <div className="px-3 py-1 border-t border-gray-400 text-right">{fmtQ(r.ventas)}</div>
                </div>
              ))}

              <div className="grid grid-cols-4 bg-gray-50 font-semibold border-t-2 border-gray-700">
                <div className="px-3 py-1 border-r border-gray-700">Total</div>
                <div className="px-3 py-1 border-r border-gray-700 text-right">{totalProspectos}</div>
                <div className="px-3 py-1 border-r border-gray-700 text-right">{totalCierres}</div>
                <div className="px-3 py-1 text-right">{fmtQ(totalVentas)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* === Análisis de Vendedor (al centro, más ancho) === */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow border border-gray-500">
            <div className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 border-b border-gray-500">
              Análisis de Vendedor
            </div>

            <div className="text-sm">
              {[
                ["Prospectos", totalProspectos, "text-gray-800"],
                ["Contacto", 0, "text-red-600"],
                ["Cita", 0, "text-gray-800"],
                ["Candidato", 0, "text-gray-800"],
                ["Cotización", 0, "text-gray-800"],
                ["Cierre", totalCierres, "text-gray-800"],
                ["Ventas", totalCierres, "text-gray-800"],
                ["Perdidos", 0, "text-gray-800"],
                ["% Conversión", `${(conversion * 100).toFixed(2)}%`, "text-blue-600"],
                ["Días Promedio", "0.00", "text-orange-600"],
                ["Q Ventas", fmtQ(totalVentas), "text-emerald-600"],
                ["$ Pérdidas", "-", "text-gray-500"],
                ["Efectividad", "0.00%", "text-gray-800"],
              ].map(([label, value, cls]) => (
                <div key={label} className="grid grid-cols-[1fr,6rem]">
                  <div className="px-3 py-1 border-t border-gray-400 text-gray-700">{label}</div>
                  <div className={`px-3 py-1 border-t border-l border-gray-400 text-right font-semibold ${cls}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === Gráfico (a la derecha) === */}
        <div className="lg:col-span-5">
          <div className="bg-white shadow border border-gray-500 rounded-md overflow-hidden">
            {/* Checkboxes */}
           <div className="flex flex-wrap justify-center items-center gap-6 px-3 py-2 border-b border-gray-200 text-sm">
             <span className="font-semibold text-gray-700">Ver:</span>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProspectos}
                  onChange={(e) => setShowProspectos(e.target.checked)}
                  className="h-4 w-4 accent-red-500"
                />
                <span>Prospectos</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCierres}
                  onChange={(e) => setShowCierres(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span>Cierres</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVentas}
                  onChange={(e) => setShowVentas(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span>Ventas (GTQ)</span>
              </label>
            </div>

           
            {/* Chart */}
<div className="h-[320px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart
      data={demo}
      margin={{ top: 6, right: 6, bottom: 6, left: 6 }}   // << menos margen externo
    >
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis
        dataKey="mes"
        tick={{ fontSize: 12 }}
        tickMargin={6}
      />

      {/* Eje izquierdo MUY angosto */}
      <YAxis
        yAxisId="left"
        allowDecimals={false}
        width={26}                      // << reserva mínima
        tick={{ fontSize: 12 }}
        tickMargin={4}
      />

      {/* Eje derecho angosto (ventas en GTQ) */}
      <YAxis
        yAxisId="right"
        orientation="right"
        width={54}                      // << lo más pequeño que permita tu formateo
        tickFormatter={(v) => fmtQ(v)}
        tick={{ fontSize: 12 }}
        tickMargin={4}
      />

      <Tooltip
        formatter={(val, name) =>
          name === "ventas" || name === "Ventas" ? fmtQ(val) : val
        }
      />

      {showProspectos && (
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="prospectos"
          name="Prospectos"
          stroke="#EF4444"
          strokeWidth={3}
          isAnimationActive
          animationDuration={900}
          animationEasing="ease-out"
          dot={{ r: 2 }}
          activeDot={{ r: 6 }}
        />
      )}
      {showCierres && (
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="cierres"
          name="Cierres"
          stroke="#2563EB"
          strokeWidth={3}
          isAnimationActive
          animationDuration={900}
          animationEasing="ease-out"
          dot={{ r: 2 }}
          activeDot={{ r: 6 }}
        />
      )}
      {showVentas && (
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="ventas"
          name="Ventas"
          stroke="#10B981"
          strokeWidth={3}
          isAnimationActive
          animationDuration={900}
          animationEasing="ease-out"
          dot={{ r: 2 }}
          activeDot={{ r: 6 }}
        />
      )}
    </ComposedChart>
  </ResponsiveContainer>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}
