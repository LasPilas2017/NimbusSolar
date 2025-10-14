import React from "react";
import {
  Users,
  UserCheck,
  DoorOpen,
  Snowflake,
  ThermometerSun,
  Flame,
} from "lucide-react";

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
      <div className="w-full bg-white rounded-xl shadow-sm border border-amber-200 px-3 pt-2 pb-0 min-h-[120px] md:min-h-[165px]">

        {/* xs: 1 col (todo apilado) | md+: 2 cols (flechas / tarjetas) */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(140px,225px)_1fr] gap-2 items-start">
          
          {/* IZQUIERDA: Flechas */}
          <div className="flex flex-col gap-2">
            <ArrowStat
              bg="bg-orange-600"
              label="BASE DE"
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

          {/* DERECHA: Cuadros */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <MiniTile
                color="#0EA5E9"
                border="#0EA5E9"
                icon={<Snowflake className="size-[18px]" />}
                label="Frío"
                value={frio}
                size="md"
              />
              <MiniTile
                color="#F2B720"
                border="#F2B720"
                icon={<ThermometerSun className="size-[18px]" />}
                label="Tibio"
                value={tibio}
                size="md"
              />
            </div>

            <MiniTile
              color="#EF7F1A"
              border="#EF7F1A"
              icon={<Flame className="size-[18px]" />}
              label="Caliente"
              value={caliente}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔸 Flechas */
function ArrowStat({ bg, label, value, icon }) {
  return (
    <div className="shrink-0">
      <div
        className={[
          "rounded-xl shadow-md text-white",
          "grid grid-cols-[auto_1fr] items-center",
          "w-full",
          "h-10 pl-5 pr-8"
,
          bg,
        ].join(" ")}
        style={{
          clipPath: "polygon(0% 0%, 90% 0%, 98% 50%, 90% 100%, 0% 100%, 0% 0%)",
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="tracking-wider font-semibold text-xs whitespace-nowrap">
            {label}
          </span>
        </div>
        <div className="flex justify-center">
          <span className="text-base md:text-lg font-extrabold leading-none">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

/* 🔸 Cuadros: ahora más anchos y con texto debajo del número */
function MiniTile({
  color,
  border,
  icon,
  label,
  value,
  size = "md",
  className = "",
}) {
const height =
  size === "lg" ? "h-15 md:h-20" : size === "md" ? "h-14 md:h-15" : "h-16";
const fontValue =
  size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-base";

  return (
    <div
      className={`w-full ${height} rounded-2xl shadow-md flex flex-col items-center justify-center ${className}`}
      style={{
        background: color,
        border: `2px solid ${border}`,
        boxShadow: "inset 0 1px 3px rgba(255,255,255,0.3)",
      }}
    >
      <div className={`text-white font-extrabold ${fontValue}`}>{value}</div>
      <div className="flex items-center gap-1 text-white mt-1">
        {icon}
        <span className="font-semibold text-sm">{label}</span>
      </div>
    </div>
  );
}
