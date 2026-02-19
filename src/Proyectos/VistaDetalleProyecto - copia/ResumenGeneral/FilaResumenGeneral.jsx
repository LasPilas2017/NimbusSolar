import React from "react";

const colorMap = {
  Utilidad: "#34D399",   // verde
  Producción: "#3B82F6", // azul
  Gastos: "#EF4444",     // rojo
};

export default function FilaResumenGeneral({
  nombre = "Producción",
  monto = 0,
  porcentaje = 0,
  color,
  onClick,
  isOpen = false,
}) {
  const fmtQ = (n) => `Q${Number(n || 0).toLocaleString("es-GT")}`;
  const pct = Math.max(0, Math.min(100, Number(porcentaje || 0)));
  const bg = color || colorMap[nombre] || "#9CA3AF";
  const clickable = typeof onClick === "function";

  return (
    <div
      role={clickable ? "button" : undefined}
      aria-expanded={clickable ? isOpen : undefined}
      onClick={onClick}
      className={[
        "bg-slate-50 px-4 py-3 rounded-2xl shadow-inner flex items-center gap-4 flex-wrap sm:flex-nowrap",
        clickable ? "cursor-pointer select-none hover:bg-slate-100 transition-colors" : "",
        isOpen ? "ring-2 ring-slate-300" : "ring-1 ring-slate-200/60",
      ].join(" ")}
    >
      <span className="font-semibold text-slate-700 w-28 min-w-[92px]">{nombre}</span>
      <span className="font-extrabold text-slate-900 w-32 min-w-[108px]">{fmtQ(monto)}</span>
      <span className="text-sm text-slate-600 w-16 min-w-[60px] text-right">{pct}%</span>

      {/* Barra de progreso */}
      <div className="relative flex-1">
        <div className="h-4 w-full bg-slate-200 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-1px_0_rgba(0,0,0,.03)]" />
        <div
          className="absolute left-0 top-0 h-4 rounded-full transition-all duration-500 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-1px_0_rgba(0,0,0,.03)]"
          style={{ width: `${pct}%`, backgroundColor: bg }}
        />
      </div>
    </div>
  );
}
