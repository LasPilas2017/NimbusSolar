import React from "react";
import THEME from "../theme"; 


// ====== Datos demo ======
const DATA = [
  {
    id: "E-001",
    nombre: "Jorge Mauricio",
    correo: "jorge.mauricio@nimbussgt.com",
    telefono: "2234-5589",
    celular: "502-5551-2333",
    direccion: "Cdad. De Guatemala",
    ciudad: "Guatemala",
    sueldoBase: 4000,
    comision: 3,
    cierres: 3,
    efectividad: 23.08,
    ventas: 12500,
  },
  {
    id: "E-002",
    nombre: "María Fernanda López",
    correo: "maria.lopez@nimbussgt.com",
    telefono: "2215-7701",
    celular: "502-4448-9012",
    direccion: "Zona 10, Edificio Verona",
    ciudad: "Guatemala",
    sueldoBase: 4200,
    comision: 4,
    cierres: 5,
    efectividad: 35.44,
    ventas: 18600,
  },
  {
    id: "E-003",
    nombre: "Luis Estuardo Pérez",
    correo: "luis.perez@nimbussgt.com",
    telefono: "2267-4510",
    celular: "502-5560-3321",
    direccion: "Zona 1, Centro Histórico",
    ciudad: "Guatemala",
    sueldoBase: 3850,
    comision: 2.5,
    cierres: 2,
    efectividad: 18.5,
    ventas: 8800,
  },
  {
    id: "E-004",
    nombre: "Carla Jiménez",
    correo: "carla.jimenez@nimbussgt.com",
    telefono: "2290-6721",
    celular: "502-5528-1145",
    direccion: "Residenciales Los Álamos",
    ciudad: "Mixco",
    sueldoBase: 4100,
    comision: 3.2,
    cierres: 4,
    efectividad: 29.8,
    ventas: 15400,
  },
  {
    id: "E-005",
    nombre: "Ricardo Gómez",
    correo: "ricardo.gomez@nimbussgt.com",
    telefono: "2256-3341",
    celular: "502-5589-0901",
    direccion: "Colonia Santa Faz",
    ciudad: "Antigua Guatemala",
    sueldoBase: 3900,
    comision: 2.8,
    cierres: 3,
    efectividad: 21.7,
    ventas: 9900,
  },
  {
    id: "E-006",
    nombre: "Daniela Morales",
    correo: "daniela.morales@nimbussgt.com",
    telefono: "2221-9904",
    celular: "502-5511-7722",
    direccion: "Zona 16, Condado Naranjo",
    ciudad: "Guatemala",
    sueldoBase: 4300,
    comision: 4.5,
    cierres: 6,
    efectividad: 40.25,
    ventas: 21200,
  },
  {
    id: "E-007",
    nombre: "Oscar Barrios",
    correo: "oscar.barrios@nimbussgt.com",
    telefono: "2274-6608",
    celular: "502-5574-3322",
    direccion: "Km 18 Carretera a El Salvador",
    ciudad: "Fraijanes",
    sueldoBase: 3700,
    comision: 2.5,
    cierres: 2,
    efectividad: 19.6,
    ventas: 7800,
  },
  {
    id: "E-008",
    nombre: "Patricia García",
    correo: "patricia.garcia@nimbussgt.com",
    telefono: "2333-2100",
    celular: "502-5569-8820",
    direccion: "Zona 14, Jardines de la Asunción",
    ciudad: "Guatemala",
    sueldoBase: 4450,
    comision: 4.2,
    cierres: 5,
    efectividad: 38.2,
    ventas: 19800,
  },
  {
    id: "E-009",
    nombre: "Andrés Molina",
    correo: "andres.molina@nimbussgt.com",
    telefono: "2298-4422",
    celular: "502-5532-6644",
    direccion: "Zona 5, Colonia La Palmita",
    ciudad: "Guatemala",
    sueldoBase: 3800,
    comision: 3.0,
    cierres: 3,
    efectividad: 25.1,
    ventas: 11200,
  },
  {
    id: "E-010",
    nombre: "Gabriela Castillo",
    correo: "gabriela.castillo@nimbussgt.com",
    telefono: "2203-9911",
    celular: "502-5599-0033",
    direccion: "Zona 2, Calle de los Olivos",
    ciudad: "Villa Nueva",
    sueldoBase: 4000,
    comision: 3.5,
    cierres: 4,
    efectividad: 31.0,
    ventas: 14500,
  },
];

// Formato Q
const fmtQ = (n) =>
  `Q${(n ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Celda
function Cell({ children, strong, align = "left" }) {
  return (
    <div
      className={`px-4 py-2.5 text-gray-900 ${
        strong ? "font-semibold" : ""
      } ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}
      style={{
        borderRight: `1px solid ${THEME.border}`,
        borderBottom: `1px solid ${THEME.border}`,
      }}
    >
      {children}
    </div>
  );
}

export default function Diseno() {
  // Supone que DATA existe (¡no la vuelvas a declarar más abajo!)
  // Calculados
  const totalEmpleados = DATA.length;
  const promComision =
    totalEmpleados ? DATA.reduce((a, r) => a + (r.comision || 0), 0) / totalEmpleados : 0;
  const sumaCierres = DATA.reduce((a, r) => a + (r.cierres || 0), 0);
  const promEfectividad =
    totalEmpleados ? DATA.reduce((a, r) => a + (r.efectividad || 0), 0) / totalEmpleados : 0;
  const sumaQComision = DATA.reduce(
    (a, r) => a + (((r.ventas || 0) * (r.comision || 0)) / 100),
    0
  );

  // ⬅️ Agregamos la columna de Q. Comisión (una columna extra de 160px)
  const COLS =
    "grid-cols-[110px,220px,260px,160px,160px,240px,160px,160px,160px,140px,140px,160px]";

  return (
    <div className="w-full min-h-screen px-6 pb-10">
      {/* Título */}
      <div className="flex items-center gap-3 mt-2 mb-2">
        <div className="text-5xl leading-none">🗒️</div>
        <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">
          Catálogo de Agentes y Vendedores
        </h1>
      </div>
      <div className="h-[4px] w-full bg-gray-800 mb-4" />

      {/* Contenedor principal */}
      <div
        className="w-full border border-gray-400 shadow overflow-x-auto"
        style={{ background: THEME.stripeAlt }}
      >
        {/* Encabezado azul */}
        <div className={`min-w-[1200px] grid ${COLS}`}>
          {[
            "ID",
            "Nombre",
            "Correo Electrónico",
            "Teléfono",
            "Celular",
            "Dirección",
            "Ciudad",
            "Sueldo Base",
            "Q. Comisión", // 👈 aquí va la columna
            "% Comisión",
            "Cierres",
            "Efectividad",
          ].map((h, idx) => (
            <div
              key={h}
              className="px-4 py-3 font-bold"
              style={{
                background: THEME.headerDark,
                color: THEME.headerText,
                borderRight: idx === 11 ? "none" : "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <span>{h}</span>
                <span className="ml-2 text-[10px] opacity-90">▾</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cuerpo crema */}
        <div className="relative min-w-[1200px]" style={{ background: THEME.stripe }}>
          {DATA.map((r) => {
            const qComision = ((r.ventas || 0) * (r.comision || 0)) / 100;
            return (
              <div
                key={r.id}
                className={`grid ${COLS}`}
                style={{
                  background: THEME.stripeAlt,
                  borderBottom: `1px solid ${THEME.border}`,
                }}
              >
                <Cell>{r.id}</Cell>
                <Cell strong>{r.nombre}</Cell>
                <Cell>
                  {r.correo ? (
                    <a className="text-blue-700 underline" href={`mailto:${r.correo}`}>
                      {r.correo}
                    </a>
                  ) : (
                    "-"
                  )}
                </Cell>
                <Cell>{r.telefono || ""}</Cell>
                <Cell>{r.celular || ""}</Cell>
                <Cell>{r.direccion || ""}</Cell>
                <Cell>{r.ciudad || ""}</Cell>
                <Cell align="right">{fmtQ(r.sueldoBase)}</Cell>
                {/* 👇 Q. Comisión vuelve aquí */}
                <Cell align="right">{fmtQ(qComision)}</Cell>
                <Cell align="right">{r.comision ? `${r.comision}%` : ""}</Cell>
                <Cell align="center">{r.cierres}</Cell>
                <Cell align="center">{r.efectividad}%</Cell>
              </div>
            );
          })}

          {/* Fila total inferior azul */}
          <div className={`grid ${COLS}`}>
            {/* “X Empleados” ocupa desde ID hasta Ciudad: 7 columnas */}
            <div
              className="px-4 py-3 font-bold text-white col-span-7"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {totalEmpleados} Empleados
            </div>
            {/* Sueldo base (no totalizado), mejor dejamos celda vacía */}
            <div
              className="px-4 py-3 font-bold text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            />
            {/* Total Q. Comisión */}
            <div
              className="px-4 py-3 font-bold text-right text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {fmtQ(sumaQComision)}
            </div>
            {/* % Comisión (promedio) */}
            <div
              className="px-4 py-3 font-bold text-right text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {promComision.toFixed(2)}%
            </div>
            {/* Cierres (suma) */}
            <div
              className="px-4 py-3 font-bold text-center text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {sumaCierres.toFixed(2)}
            </div>
            {/* Efectividad (promedio) */}
            <div className="px-4 py-3 font-bold text-center text-white" style={{ background: THEME.header }}>
              {promEfectividad.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}