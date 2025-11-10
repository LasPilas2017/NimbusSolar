// src/modules/vendedor/ui/pages/PROSPECTOS.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Pantalla "Catálogo de Prospectos" del sistema del vendedor.
//
// - CAPA: UI (React).
// - DATOS: por ahora usa datos de DEMO en memoria.
//   Más adelante se puede conectar a Supabase (tabla sugerida: "prospectos")
//   mediante casos de uso en application + repositorios en infra.
// -----------------------------------------------------------------------------  

import React from "react";

// Formatear montos en quetzales
const fmtQ = (n) =>
  n == null || n === ""
    ? "-"
    : `Q${Number(n).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

// Badge de estado (Prospecto / Venta, etc.)
function BadgeEstado({ estado }) {
  const isVenta = (estado || "").toLowerCase() === "venta";
  const color = isVenta ? "text-emerald-300" : "text-blue-300";
  const bg = isVenta ? "bg-emerald-400/15" : "bg-blue-400/15";
  const border = isVenta ? "border-emerald-300/40" : "border-blue-300/40";

  return (
    <span
      className={[
        "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold",
        "uppercase tracking-wide",
        bg,
        border,
        color,
      ].join(" ")}
    >
      {estado || "-"}
    </span>
  );
}

// Celda reutilizable de la “tabla”
function Cell({ children, strong, align = "left" }) {
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";

  return (
    <div
      className={[
        "px-4 py-2.5 text-xs md:text-sm border-b border-slate-700/70",
        "text-slate-50 whitespace-nowrap overflow-hidden text-ellipsis",
        strong ? "font-semibold" : "font-normal",
        alignClass,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function PROSPECTOS() {
  // ---------------------------------------------------------------------------
  // DATOS DEMO (luego esto lo cambiamos por datos reales desde Supabase)
  // ---------------------------------------------------------------------------
  const demoData = [
    {
      id: 1,
      nombre: "Juan Pérez",
      empresa: "Solar GT",
      correo: "juan@solar.com",
      telefono: "5555-1234",
      celular: "5555-5678",
      direccion: "Zona 10, Guatemala",
      departamento: "Guatemala",
      municipio: "Guatemala",
      segmento: "Residencial",
      tipoInstalacion: "On-Grid",
      promedioKW: 5.4,
      promedioQ: 36000,
      fecha: "2025-03-15",
      dias: 8,
      estado: "Prospecto",
      compras: 0,
    },
    {
      id: 2,
      nombre: "María López",
      empresa: "Energía Total",
      correo: "maria@energia.com",
      telefono: "4444-1234",
      celular: "4444-5678",
      direccion: "Chimaltenango Centro",
      departamento: "Chimaltenango",
      municipio: "Chimaltenango",
      segmento: "Industrial",
      tipoInstalacion: "Off-Grid",
      promedioKW: 10.2,
      promedioQ: 68000,
      fecha: "2025-02-10",
      dias: 20,
      estado: "Venta",
      compras: 4500,
    },
  ];

  const COLS =
    "grid-cols-[80px,220px,200px,230px,120px,120px,260px,160px,160px,160px,160px,140px,160px,160px,160px,140px,160px]";

  const totalProspectos = demoData.length;
  const totalCompras = demoData.reduce((a, r) => a + (r.compras || 0), 0);

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90">
      <div className="w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex flex-col">
        {/* ENCABEZADO */}
        <div className="px-5 sm:px-6 md:px-8 py-5 sm:py-6 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                Catálogo de Prospectos
              </h1>
              <p className="text-sm text-white/70 mt-1">
                Seguimiento de prospectos, estado y potencial de compra.
              </p>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="text-sm text-white/60">
                Total prospectos
              </span>
              <span className="text-2xl font-semibold text-emerald-300">
                {totalProspectos}
              </span>
            </div>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="flex-1 overflow-hidden">
          <div className="w-full h-full overflow-x-auto overflow-y-auto">
            <div className="min-w-[1900px]">
              {/* ENCABEZADOS */}
              <div className={`grid ${COLS} bg-slate-950/90`}>
                {[
                  "ID",
                  "Nombre",
                  "Empresa",
                  "Correo",
                  "Teléfono",
                  "Celular",
                  "Dirección",
                  "Departamento",
                  "Municipio",
                  "Segmento",
                  "Instalación",
                  "Promedio kW",
                  "Promedio Q",
                  "Fecha",
                  "Días Últ. Contacto",
                  "Estado",
                  "Compras",
                ].map((h, idx, all) => (
                  <div
                    key={h}
                    className={[
                      "px-4 py-3 text-[11px] md:text-xs font-semibold uppercase tracking-wide",
                      "text-slate-100 border-b border-slate-700/80",
                      "border-r border-slate-800/80 last:border-r-0",
                    ].join(" ")}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* CUERPO */}
              <div className="relative bg-slate-900/40">
                {demoData.map((r, idx) => {
                  const stripeClass =
                    idx % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/40";

                  return (
                    <div
                      key={r.id}
                      className={`grid ${COLS} ${stripeClass}`}
                    >
                      <Cell>{r.id}</Cell>
                      <Cell strong>{r.nombre}</Cell>
                      <Cell>{r.empresa}</Cell>
                      <Cell>
                        <a
                          className="text-cyan-300 underline hover:text-cyan-200"
                          href={`mailto:${r.correo}`}
                        >
                          {r.correo}
                        </a>
                      </Cell>
                      <Cell>{r.telefono}</Cell>
                      <Cell>{r.celular}</Cell>
                      <Cell>{r.direccion}</Cell>
                      <Cell>{r.departamento}</Cell>
                      <Cell>{r.municipio}</Cell>
                      <Cell>{r.segmento}</Cell>
                      <Cell>{r.tipoInstalacion}</Cell>
                      <Cell align="right">{r.promedioKW} kW</Cell>
                      <Cell align="right">{fmtQ(r.promedioQ)}</Cell>
                      <Cell>{r.fecha}</Cell>
                      <Cell align="center">{r.dias}</Cell>
                      <Cell align="center">
                        <BadgeEstado estado={r.estado} />
                      </Cell>
                      <Cell align="right">{fmtQ(r.compras)}</Cell>
                    </div>
                  );
                })}

                {/* TOTALES */}
                <div className={`grid ${COLS} bg-slate-950/90`}>
                  <div className="px-4 py-3 text-xs md:text-sm font-semibold text-white border-t border-slate-700/80 border-r border-slate-800/80 col-span-15">
                    {totalProspectos} prospectos registrados
                  </div>
                  <div className="px-4 py-3 text-xs md:text-sm font-semibold text-right text-emerald-200 border-t border-slate-700/80 col-span-2">
                    Total compras: {fmtQ(totalCompras)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
