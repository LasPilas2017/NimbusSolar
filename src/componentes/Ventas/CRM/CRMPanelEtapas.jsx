// CRMPanelEtapas.jsx (alineado y alturas uniformes)
export default function CRMPanelEtapas({
  valores = [0, 0, 0, 0, 0, 0],
  porcentajes = [100, 100, 100, 100, 100, 100],
  etiquetas = [
    "Contacto",
    "Cita",
    "Seguimiento",
    "Cotización",
    "Visitas Técnicas",
    "Cierre",
  ],
  className = "",
}) {
  const colors = [
    { border: "#E34242", bar: "#F3A0A0", text: "#9B1B17" }, // rojo
    { border: "#F28A2D", bar: "#FDBA94", text: "#9A4A0A" }, // naranja
    { border: "#F2C51B", bar: "#FDE27E", text: "#8A6A00" }, // amarillo
    { border: "#7AC56C", bar: "#CDECC2", text: "#336633" }, // verde claro
    { border: "#1C94A3", bar: "#A0E3EC", text: "#0B4F57" }, // azul verdoso (Visitas Técnicas)
    { border: "#37C796", bar: "#AEEFD8", text: "#0F6B52" }, // verde (Cierre)
  ];

  return (
    <div
  className={`w-full bg-white rounded-xl shadow-sm border border-amber-200 px-2 pt-1 pb-[2px] h-full overflow-hidden ${className}`}
>

      {/* 6 columnas; items-start para no “estirar” por textos largos */}
      <div className="grid grid-cols-6 gap-3 justify-items-center items-start">
        {Array.from({ length: 6 }).map((_, i) => (
          <StageCard
            key={i}
            value={valores[i] ?? 0}
            percent={porcentajes[i] ?? 0}
            label={etiquetas[i] ?? ""}
            color={colors[i]}
          />
        ))}
      </div>
    </div>
  );
}

/* --- Tarjeta individual con medidas consistentes --- */
function StageCard({ value = 0, percent = 0, label = "", color }) {
  const pct = clamp(percent);

  return (
    <div className="w-full h-full flex flex-col items-stretch justify-between select-none">
      {/* Número principal (alto fijo) */}
      <div
        className="h-[76px] md:h-[88px] rounded-xl bg-white flex items-center justify-center"
        style={{ border: `3px solid ${color.border}` }}
      >
        <span
          className="font-extrabold text-4xl md:text-5xl leading-none"
          style={{ color: color.text }}
        >
          {value}
        </span>
      </div>

      {/* Barra de porcentaje (alto fijo) */}
      <div
        className="mt-2 h-7 rounded-md px-3 flex items-center justify-center text-white text-[12px] md:text-sm font-extrabold"
        style={{ background: color.bar, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {pct.toFixed(2)}%
      </div>

      {/* Etiqueta (alto fijo para que todas midan igual) */}
     <div
  className="text-center text-[13px] font-semibold text-gray-700 flex items-center justify-center whitespace-nowrap"
  style={{ height: "28px" }}
>
  {label}
</div>

    </div>
  );
}

/* --- Límite de porcentaje --- */
function clamp(n) {
  if (Number.isNaN(+n)) return 0;
  if (+n < 0) return 0;
  if (+n > 100) return 100;
  return +n;
}
