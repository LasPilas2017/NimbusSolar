import React from "react";

/**
 * Círculo grande de progreso del proyecto.
 * Usa solo Tailwind + SVG (sin CSS extra).
 */
export default function ProgresoProyecto({
  porcentaje = 56,         // ← cambia este valor desde el padre
  size = 180,              // diámetro
  stroke = 14,             // grosor
  color = "#3B82F6",       // color de avance
  track = "#E5E7EB",       // color de pista
  label = "Progreso del proyecto",
}) {
  const p = Math.max(0, Math.min(100, Number(porcentaje)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2" aria-label={label}>
      <svg width={size} height={size} className="drop-shadow-sm">
        <defs>
          <linearGradient id="pp-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Pista */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={track} strokeWidth={stroke} fill="none"
        />
        {/* Avance */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#pp-grad)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Texto central */}
        <text
          x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
          fontSize={size * 0.26} fontWeight="800" fill="#0f172a"
        >
          {Math.round(p)}%
        </text>
      </svg>

      <div className="text-sm font-medium text-slate-700">{label}</div>
      </div>
  );
}
