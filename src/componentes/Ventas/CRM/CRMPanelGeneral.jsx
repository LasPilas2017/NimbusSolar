import React, { useEffect, useState } from "react";
import { Users, UserCheck, DoorOpen, Snowflake, ThermometerSun, Flame } from "lucide-react";

/* 🔢 Hook para animar conteo de los números */
function useCountTo(target, duration = 800) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    let raf;
    let start = null;
    const from = display;
    const delta = target - from;

    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const value = from + delta * p;
      setDisplay(value);
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

export default function CRMPanelGeneral({
  baseTotal = 320,
  enProceso = 0,
  finalizados = 3,
  frio = 0,
  tibio = 0,
  caliente = 0,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {/* Marco principal */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-amber-200 px-3 pt-3 pb-2 min-h-[120px] md:min-h-[165px]">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(130px,180px)_1fr] gap-2 items-start">
          
          {/* IZQUIERDA: Flechas animadas */}
          <div className="flex flex-col gap-2">
            <ArrowStat
              bg="bg-orange-600"
              label="CLIENTES"
              value={baseTotal}
              icon={<Users className="size-[16px] md:size-[18px] opacity-90" />}
            />
            <ArrowStat
              bg="bg-amber-600"
              label="EN PROCESO"
              value={enProceso}
              icon={<UserCheck className="size-[16px] md:size-[18px] opacity-90" />}
            />
            <ArrowStat
              bg="bg-green-700"
              label="FINALIZADOS"
              value={finalizados}
              icon={<DoorOpen className="size-[16px] md:size-[18px] opacity-90" />}
            />
          </div>

          {/* DERECHA: Frío/Tibio arriba, Caliente abajo */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <AnimatedTile color="#0EA5E9" border="#0EA5E9" icon={<Snowflake className="size-[28px]" />} value={frio} />
              <AnimatedTile color="#F2B720" border="#F2B720" icon={<ThermometerSun className="size-[28px]" />} value={tibio} />
            </div>
            <div className="grid grid-cols-1">
              <AnimatedTile color="#EF7F1A" border="#EF7F1A" icon={<Flame className="size-[30px]" />} value={caliente} />
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Animaciones globales (texto y número) */}
      <style>{`
        @keyframes labelWave {
          0% { transform: translateY(0); opacity: .92; }
          50% { transform: translateY(-1px); opacity: 1; }
          100% { transform: translateY(0); opacity: .92; }
        }
        .label-anim { animation: labelWave 2.4s ease-in-out infinite; }

        @keyframes popIn {
          0% { transform: scale(.96); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .value-pop { animation: popIn .45s ease-out; }
      `}</style>
    </div>
  );
}

/* 🔸 Flechas con animación de texto y número */
function ArrowStat({ bg, label, value, icon }) {
  const animatedValue = useCountTo(Number(value) || 0, 800);

  return (
    <div className="shrink-0">
      <div
        className={[
          "rounded-xl shadow-md text-white",
          "grid grid-cols-[auto_1fr] items-center",
          "w-full h-12 md:h-12 pl-3 pr-7",
          bg,
        ].join(" ")}
        style={{
          clipPath: "polygon(0% 0%, 90% 0%, 98% 50%, 90% 100%, 0% 100%, 0% 0%)",
        }}
      >
        {/* Texto e ícono con movimiento suave */}
        <div className="flex items-center gap-2 label-anim">
          {icon}
          <span className="tracking-wider font-semibold text-xs whitespace-normal text-left leading-tight">
            {label}
          </span>
        </div>

        {/* Número con conteo + efecto de aparición */}
        <div className="flex justify-center">
          <span className="value-pop text-lg md:text-xl font-extrabold leading-none tabular-nums">
            {Number(animatedValue).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* 🔸 Cuadros animados: alternan número ↔ ícono */
function AnimatedTile({ color, border, icon, value }) {
  const [showNumber, setShowNumber] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShowNumber((prev) => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full h-[65px] md:h-[80px] rounded-2xl shadow-md flex items-center justify-center overflow-hidden relative"
      style={{
        background: color,
        border: `2px solid ${border}`,
        boxShadow: "inset 0 1px 3px rgba(255,255,255,0.3)",
      }}
    >
      <div
        className={`text-white text-2xl font-extrabold transition-opacity duration-700 absolute ${
          showNumber ? "opacity-100" : "opacity-0"
        }`}
      >
        {value}
      </div>
      <div
        className={`text-white transition-opacity duration-700 ${
          showNumber ? "opacity-0" : "opacity-100"
        }`}
      >
        {icon}
      </div>
    </div>
  );
}
