import React from "react";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

/**
 * Panel: Ventas / Conversión / Ciclo / Perdidos-Embudo-Venta
 *
 * Props:
 *  ventasCount      = 3
 *  ventasMonto      = 12000
 *  perdidasCount    = 0
 *  conversionPct    = 100
 *  cicloVenta       = 3.0
 *  perdidosPct      = 0
 *  embudoPct        = 0
 *  ventaPct         = 100
 */
export default function CRMPanelConversion({
  ventasCount = 3,
  ventasMonto = 12000,
  perdidasCount = 0,
  conversionPct = 100,
  cicloVenta = 3.0,
  perdidosPct = 0,
  embudoPct = 0,
  ventaPct = 100,
}) {
  return (
    <div className="w-full bg-white rounded-xl p-3 border border-amber-200 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* ===================== BLOQUE IZQUIERDA (ventas/perdidas) ===================== */}
        <div className="grid grid-cols-2 gap-3">
          {/* “Tarjeta” con 3 triángulos (ventas) */}
          <div className="relative rounded-md">
            {/* marco blanco exterior */}
            <div className="absolute inset-0 rounded-md ring-2 ring-amber-200 pointer-events-none" />
            <div className="relative h-28">
              {/* triángulo superior (verde claro con $) */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath:
                    "polygon(0% 50%, 12% 15%, 16% 10%, 22% 6%, 30% 4%, 40% 3%, 100% 3%, 100% 50%)",
                  background: "#9ed08f",
                  border: "2px solid #9ed08f",
                }}
              />
              {/* triángulo superior verde con 'Ventas' y contador */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath:
                    "polygon(12% 15%, 100% 3%, 100% 50%, 44% 50%)",
                  background: "#2E944B",
                  border: "2px solid #2E944B",
                }}
              />
              {/* triángulo pequeño $ */}
              <div className="absolute top-1 left-5 text-white/95">
                <DollarSign size={18} />
              </div>
              <div className="absolute top-2 right-3 text-white font-semibold">
                Ventas
              </div>
              <div className="absolute top-7 right-3 text-white text-lg font-extrabold">
                {ventasCount}
              </div>

              {/* triángulo izquierdo (monto) */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath:
                    "polygon(0% 50%, 12% 15%, 44% 50%, 0% 50%)",
                  background: "#2E944B",
                  borderLeft: "2px solid #2E944B",
                  borderBottom: "2px solid #2E944B",
                }}
              />
              <div className="absolute left-4 top-12 text-white text-sm font-semibold">
                {ventasMonto.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              {/* triángulo inferior (perdidas rojo) */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath:
                    "polygon(0% 50%, 44% 50%, 100% 80%, 100% 97%, 3% 97%, 3% 50%)",
                  background: "#E53935",
                  border: "2px solid #E53935",
                }}
              />
              <div className="absolute left-4 bottom-2 text-white/90 text-sm italic">
                Perdidas
              </div>
              <div className="absolute right-4 bottom-4 text-white text-base font-bold">
                {perdidasCount}
              </div>
            </div>
          </div>

          {/* Separador vertical “estilo Excel” (opcional en desktop) */}
          <div className="hidden lg:block w-1 rounded bg-amber-200/70 mx-auto" />
        </div>

        {/* ===================== BLOQUE CENTRO (conversión y ciclo) ===================== */}
        <div className="grid grid-rows-2 gap-3">
          {/* Conversión */}
          <div className="relative h-14 rounded-md bg-[#3D3D3D] text-white">
            <div className="absolute inset-0 rounded-md ring-2 ring-amber-200/70 pointer-events-none" />
            <div className="h-full w-full flex items-center justify-between px-4">
              <div className="flex items-center gap-2 font-semibold tracking-wide">
                <TrendingUp size={18} />
                CONVERSIÓN
              </div>
              <div className="text-[#F2B81B] font-extrabold text-xl">
                {Number(conversionPct).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Ciclo de Venta */}
          <div className="relative h-14 rounded-md bg-[#AFC7E8] text-[#2a4a78]">
            <div className="absolute inset-0 rounded-md ring-2 ring-amber-200/70 pointer-events-none" />
            <div className="h-full w-full flex items-center justify-between px-4">
              <div className="flex items-center gap-2 font-semibold tracking-wide">
                {/* mini “calendario” con líneas para simular el ícono */}
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="#2a4a78" strokeWidth="2"/>
                  <line x1="3" y1="9" x2="21" y2="9" stroke="#2a4a78" strokeWidth="2"/>
                  <line x1="8" y1="1.5" x2="8" y2="6" stroke="#2a4a78" strokeWidth="2"/>
                  <line x1="16" y1="1.5" x2="16" y2="6" stroke="#2a4a78" strokeWidth="2"/>
                </svg>
                CICLO DE VENTA
              </div>
              <div className="text-[rgba(42,74,120,0.95)] font-extrabold text-xl">
                {cicloVenta}
              </div>
            </div>
          </div>
        </div>

        {/* ===================== BLOQUE DERECHO (barras de % ) ===================== */}
        <div className="grid grid-rows-3 gap-3">
          <RightBar
            label="PERDIDOS"
            color="#F20D0D"
            value={perdidosPct}
          />
          <RightBar
            label="EMBUDO"
            color="#F2B81B"
            value={embudoPct}
          />
          <RightBar
            label="VENTA"
            color="#24A96B"
            value={ventaPct}
          />
        </div>
      </div>
    </div>
  );
}

/* ======================== Subcomponente derecha ======================== */
function RightBar({ label, color, value = 0 }) {
  return (
    <div
      className="h-12 w-full rounded-lg text-white font-bold flex items-center justify-between px-4"
      style={{ background: color }}
    >
      <div className="tracking-wide">{label}</div>
      {/* separador vertical blanco */}
      <div className="h-6 w-[2px] bg-white/90 mx-2" />
      <div className="text-right">{Number(value).toFixed(2)}%</div>
    </div>
  );
}
