import React, { useState } from "react";
import { TrendingUp, Hash } from "lucide-react";
import "../styles/CRMESTILOS.css";

export default function CRMPanelConversion({
  className = "",
  ventasCount = 3,
  ventasMonto = 12000,
  perdidasCount = 0,
  perdidasMonto = 0,
  conversionPct = 100,
  cicloVenta = 3.0,
  perdidosPct = 0,
  embudoPct = 0,
  ventaPct = 100,
}) {
  const fmtMoney = (n) =>
    (n ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      className={`h-full rounded-2xl border border-amber-200 bg-white/80 p-3 shadow-sm ${className}`}
    >
      {/* Grid RESPONSIVO */}
      <div
        className="
          grid gap-2 w-full
          grid-cols-1
          sm:grid-cols-2
          lg:[grid-template-columns:repeat(3,minmax(0,1fr))]
        "
      >
        {/* ============ COLUMNA IZQUIERDA (chips) ============ */}
        <div className="min-w-0 w-full h-full flex items-start">
          <div className="flex flex-col gap-[10px] w-full">
            <Tile className="bg-green-600 text-white inline-flex items-center justify-between gap-3 px-3 py-4">
              <SwapFade
                left={
                  <span className="font-semibold text-[13px] flex items-center gap-4">
                    <span className="font-bold">Q</span> Ventas
                  </span>
                }
                right={
                  <span className="font-extrabold text-[13px] tabular-nums">
                    {fmtMoney(ventasMonto)}
                  </span>
                }
              />
            </Tile>

            <Tile className="bg-green-700 text-white inline-flex items-center justify-between gap-3 px-3 py-4">
              <SwapFade
                left={
                  <span className="font-semibold text-[13px] flex items-center gap-4">
                    <Hash size={12} /> Ventas
                  </span>
                }
                right={
                  <span className="font-extrabold text-[13px] tabular-nums">
                    {ventasCount}
                  </span>
                }
              />
            </Tile>

            <Tile className="bg-red-500 text-white inline-flex items-center justify-between gap-3 px-3 py-4">
              <SwapFade
                left={
                  <span className="font-semibold text-[13px] flex items-center gap-4">
                    <span className="font-bold">Q</span> Pérdidas
                  </span>
                }
                right={
                  <span className="font-extrabold text-[13px] tabular-nums">
                    {perdidasMonto ? fmtMoney(perdidasMonto) : "-"}
                  </span>
                }
              />
            </Tile>

            <Tile className="bg-red-600 text-white inline-flex items-center justify-between gap-3 px-3 py-4">
              <SwapFade
                left={
                  <span className="font-semibold text-[13px] flex items-center gap-4">
                    <Hash size={12} /> Pérdidas
                  </span>
                }
                right={
                  <span className="font-extrabold text-[13px] tabular-nums">
                    {perdidasCount}
                  </span>
                }
              />
            </Tile>
          </div>
        </div>

        {/* ============ COLUMNA CENTRO (Conversión / Ciclo) ============ */}
        <div className="min-w-0 w-full flex flex-col">
          <div className="relative flex flex-col items-center justify-center rounded-t-xl bg-zinc-800 px-3 h-[80px] text-white text-center w-full">
            <div className="font-semibold tracking-wide text-[12px] flex items-center gap-1 mb-1">
              <TrendingUp size={14} /> CONVERSIÓN
            </div>
            <div className="text-amber-300 text-xl font-extrabold leading-none">
              {Number(conversionPct).toFixed(2)}%
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-t-xl ring-2 ring-amber-200/70" />
          </div>

          <div className="relative flex flex-col items-center justify-center rounded-b-xl bg-[#AFC7E8] px-3 h-[80px] text-[#2a4a78] text-center w-full">
            <div className="font-semibold tracking-wide text-[12px] flex items-center gap-[4px] mb-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden
                className="translate-y-[1px]"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="2"
                  fill="none"
                  stroke="#2a4a78"
                  strokeWidth="2"
                />
                <line
                  x1="3"
                  y1="9"
                  x2="21"
                  y2="9"
                  stroke="#2a4a78"
                  strokeWidth="2"
                />
                <line
                  x1="8"
                  y1="2"
                  x2="8"
                  y2="6"
                  stroke="#2a4a78"
                  strokeWidth="2"
                />
                <line
                  x1="16"
                  y1="2"
                  x2="16"
                  y2="6"
                  stroke="#2a4a78"
                  strokeWidth="2"
                />
              </svg>
              <span className="ml-[1px]">CICLO DE VENTA</span>
            </div>
            <div className="text-xl font-extrabold leading-none">{cicloVenta}</div>
            <div className="pointer-events-none absolute inset-0 rounded-b-xl ring-2 ring-amber-200/70" />
          </div>
        </div>

        {/* ============ COLUMNA DERECHA (barras) ============ */}
        <div className="min-w-0 w-full flex flex-col gap-2">
          <RightBar label="PERDIDOS" color="#F20D0D" value={perdidosPct} />
          <RightBar label="EMBUDO" color="#F2B81B" value={embudoPct} />
          <RightBar label="VENTA" color="#24A96B" value={ventaPct} />
        </div>
      </div>
    </div>
  );
}

/* ------- Tile ------- */
function Tile({ className = "", children }) {
  return (
    <div
      className={`w-full rounded-xl p-3 shadow-sm ring-2 ring-amber-200/70 ${className}`}
    >
      {children}
    </div>
  );
}

/* ------- Barra derecha ------- */
function RightBar({ label, color, value = 0 }) {
  return (
    <div
      className="flex h-[48px] w-full items-center justify-between rounded-md px-3 font-semibold text-white text-[11px] leading-none"
      style={{ background: color }}
    >
      <div className="flex-1 text-left truncate">{label}</div>
      <div className="self-center mx-[6px] h-[60%] w-[1.5px] bg-white/95 rounded-full" />
      <div className="flex-shrink-0 text-right tabular-nums tracking-tight">
        {Number(value).toFixed(2)}%
      </div>
    </div>
  );
}

/* ------- Hover: muestra número al pasar el mouse ------- */
function SwapFade({ left, right, fadeMs = 300 }) {
  const [showLeft, setShowLeft] = useState(true); // true = texto, false = número

  return (
    <div
      className="flex items-center justify-between w-full relative"
      onMouseEnter={() => setShowLeft(false)} // Mostrar número
      onMouseLeave={() => setShowLeft(true)}  // Volver al texto
    >
      <div className="flex items-center justify-between w-full relative">
        {/* Texto */}
        <div
          className="absolute inset-0 flex items-center justify-between px-3 transition-opacity"
          style={{
            opacity: showLeft ? 1 : 0,
            transitionDuration: `${fadeMs}ms`,
          }}
        >
          {left}
        </div>

        {/* Número */}
        <div
          className="absolute inset-0 flex items-center justify-between px-3 transition-opacity"
          style={{
            opacity: showLeft ? 0 : 1,
            transitionDuration: `${fadeMs}ms`,
          }}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
