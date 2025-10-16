// CRMPanelEtapas.jsx — sin contornos, con blob animado y marquee
import "./CRMESTILOS.css";

export default function CRMPanelEtapas({
  valores = [0, 0, 0, 0, 0, 0],
  porcentajes = [100, 100, 100, 100, 100, 100],
  etiquetas = [
    "Contacto",
    "Cita",
    "Avance",
    "Cotización",
    "Visitas Técnicas",
    "Cierre",
  ],
  className = "",
}) {
  const colors = [
    { border: "#E34242", bar: "#F3A0A0", text: "#9B1B17" },
    { border: "#F28A2D", bar: "#FDBA94", text: "#9A4A0A" },
    { border: "#F2C51B", bar: "#FDE27E", text: "#8A6A00" },
    { border: "#7AC56C", bar: "#CDECC2", text: "#336633" },
    { border: "#1C94A3", bar: "#A0E3EC", text: "#0B4F57" },
    { border: "#37C796", bar: "#AEEFD8", text: "#0F6B52" },
  ];

  return (
    <div
      className={`w-full bg-white rounded-xl shadow-sm border border-amber-200 px-3 pt-2 pb-0 h-full ${className}`}
    >
      <div className="h-full min-h-[160px] md:min-h-[170px]">

        <div
          className="grid grid-cols-6 gap-x-3 gap-y-0 justify-items-center items-stretch h-full"
          style={{ alignContent: "stretch" }}
        >
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
    </div>
  );
}

/* --- Tarjeta individual --- */
function StageCard({ value = 0, percent = 0, label = "", color }) {
  const pct = clamp(percent);

  return (
    <div className="w-full h-full min-h-0 flex flex-col items-stretch select-none">
      {/* BLOQUE DEL NÚMERO — con blob animado */}
      <div className="flex-1 min-h-[75px]">
        <div className="card">
          <div className="blob" style={{ backgroundColor: color.border }}></div>
          <div className="bg">
            <div
              className="h-full w-full flex items-center justify-center rounded-xl"
              style={{ border: `3px solid ${color.border}` }}
            >
              <span
                className="font-extrabold text-4xl md:text-5xl leading-none"
                style={{ color: color.text }}
              >
                {value}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE PORCENTAJE */}
      <div
        className="mt-2 h-9 md:h-10 rounded-md px-3 flex items-center justify-center text-white text-[12px] md:text-sm font-extrabold"
        style={{
          background: color.bar,
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {pct.toFixed(2)}%
      </div>

      {/* ETIQUETA — fija, ajustable según longitud */}
<div className="h-9 md:h-9 flex items-center justify-center">
  <div className="w-full text-center flex flex-col items-center justify-center px-1">
    <span
      className="font-semibold text-gray-700 leading-tight break-words text-[13px] text-balance"
      style={{
        whiteSpace: "normal",
        lineHeight: "1.1",
        wordBreak: "break-word",
        textAlign: "center",
        display: "inline-block",
        maxWidth: "100%",
        fontSize: "clamp(10px, 1vw, 13px)", // se reduce si es muy largo
      }}
    >
      {label.includes(" ") ? (
        <>
          {label.split(" ").map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </>
      ) : (
        label
      )}
    </span>
  </div>
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
