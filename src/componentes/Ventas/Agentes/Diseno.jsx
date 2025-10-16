import React, { useMemo, useState } from "react";
import THEME from "./theme"; 
import ModalBase from "./ModalBase";
import FormAgentes from "./FormAgentes";

//quitamos la suma de comision
// la suma de efectividad es un promedio 
// agregar una columna de total pago sueldo base mas comision 
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
    efectividad: 100,
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
    efectividad: 98,
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
    efectividad: 97,
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
    efectividad: 80,
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
    efectividad: 96,
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
    efectividad: 60,
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
/*
const DATA = [
  { id: 1, nombre: "Juan Pérez", sueldoBase: 3500, ventas: 22000, comision: 4, cierres: 8, efectividad: 91, correo:"", dpi:"", telefono:"", direccion:"", ciudad:"" },
  { id: 2, nombre: "Ana López",  sueldoBase: 3200, ventas: 26500, comision: 3.5, cierres: 10, efectividad: 97 },
  { id: 3, nombre: "Luis Gómez", sueldoBase: 3000, ventas: 18000, comision: 4.2, cierres: 7, efectividad: 83 },
];
*/
// ===== Utilidad: Formato de Quetzales
const fmtQ = (n) =>
  `Q${(n ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ===== Celda reutilizable
function Cell({ children, strong, align = "left", className = "" }) {
  return (
    <div
      className={`px-4 py-3 text-gray-900 whitespace-nowrap ${strong ? "font-semibold" : ""} ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
      } ${className}`}
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
  // ===== Estado modal
  const [selected, setSelected] = React.useState(null);
  const [formData, setFormData] = React.useState(null);

  // ===== Cálculos base
  const totalEmpleados = React.useMemo(() => DATA.length, [DATA]);

  const promComision = React.useMemo(
    () => (DATA.length ? DATA.reduce((a, r) => a + (r.comision || 0), 0) / DATA.length : 0),
    [DATA]
  );

  const sumaCierres = React.useMemo(
    () => DATA.reduce((a, r) => a + (r.cierres || 0), 0),
    [DATA]
  );

  const promEfectividad = React.useMemo(
    () => (DATA.length ? DATA.reduce((a, r) => a + (r.efectividad || 0), 0) / DATA.length : 0),
    [DATA]
  );

  // ===== Totales requeridos
  const sumaSueldoBase = React.useMemo(
    () => DATA.reduce((a, r) => a + (r.sueldoBase || 0), 0),
    [DATA]
  );

  const sumaQComision = React.useMemo(
    () => DATA.reduce((a, r) => a + (((r.ventas || 0) * (r.comision || 0)) / 100), 0),
    [DATA]
  );

  const sumaTotalPago = React.useMemo(
    () =>
      DATA.reduce(
        (a, r) => a + ((r.sueldoBase || 0) + ((r.ventas || 0) * (r.comision || 0)) / 100),
        0
      ),
    [DATA]
  );

  /**
   * ✅ Columnas responsivas:
   * - Se definen anchos mínimos realistas y se reparten el espacio restante con fracciones.
   * - Así la tabla SIEMPRE ocupa todo el ancho del contenedor (sin espacio vacío a la derecha).
   */
  const COLS =
    "grid-cols-[80px_minmax(240px,1.6fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(150px,1.1fr)_minmax(130px,0.9fr)_minmax(110px,0.8fr)_minmax(170px,1fr)]";

  // ✅ La tabla se estira a todo el ancho, pero mantiene un mínimo para no romper diseño
  const TABLE_W = "w-full min-w-[1230px]";

  // ===== Color círculo efectividad
  const getColor = (ef) => {
    if (ef >= 95 && ef <= 100) return "bg-emerald-500";
    if (ef >= 60 && ef <= 94) return "bg-amber-400";
    return "bg-red-500";
  };

  // ===== Handlers modal
  const openForm = (row) => {
    setSelected(row);
    setFormData({
      correo: row.correo || "",
      dpi: row.dpi || "",
      telefono: row.telefono || "",
      direccion: row.direccion || "",
      ciudad: row.ciudad || "",
    });
  };
  const closeForm = () => {
    setSelected(null);
    setFormData(null);
  };
  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSave = (e) => {
    e.preventDefault();
    console.log("Guardar:", { id: selected?.id, ...formData });
    closeForm();
  };

  return (
    <div className="w-full min-h-screen px-6 pb-12" style={{ background: THEME.background }}>
      {/* ===== Título ===== */}
      <div className="flex items-center justify-center gap-3 mt-6 mb-3 w-full text-center">
        <div className="text-5xl leading-none">🗒️</div>
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight"
          style={{ color: THEME.textPrimary }}
        >
          Catálogo de Agentes y Vendedores
        </h1>
      </div>

      <div
        className="h-[3px] w-full rounded-full mb-6"
        style={{ background: `linear-gradient(90deg, ${THEME.headerDark}, ${THEME.header}, ${THEME.headerLight})` }}
      />

      {/* ===== Tabla ===== */}
<div
  className="w-full rounded-3xl shadow-lg ring-1 overflow-hidden"
  style={{ background: THEME.surface }}
>
  {/* Contenedor scrollable SOLO del cuerpo */}
{/* Contenedor scrollable SOLO del cuerpo */}
<div
  className={`overflow-x-auto ${
    DATA.length > 10 ? "overflow-y-auto" : "overflow-y-visible"
  }`}
  style={{
    maxHeight: DATA.length > 9 ? "calc(125vh - 320px)" : "none",
  }}
>

    {/* Encabezado fijo */}
    <div
      className={`${TABLE_W} grid ${COLS} sticky top-0 z-10`}
      style={{
        borderBottom: `1px solid ${THEME.border}`,
        background: `linear-gradient(180deg, ${THEME.headerDark}, ${THEME.header})`,
      }}
    >
      {[
        "ID",
        "Nombre",
        "Sueldo Base",
        "Q. Comisión",
        "Total Pago",
        "% Comisión",
        "Cierres",
        "Efectividad",
      ].map((h, idx, arr) => (
        <div
          key={h}
          className="px-4 py-3 font-semibold whitespace-nowrap"
          style={{
            color: THEME.headerText,
            borderRight:
              idx === arr.length - 1
                ? "none"
                : "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="tracking-wide">{h}</span>
            <span className="ml-2 text-[10px] opacity-90">▾</span>
          </div>
        </div>
      ))}
    </div>

    {/* Cuerpo */}
    <div className={`${TABLE_W}`}>
      {DATA.map((r, rowIdx) => {
        const qComision = ((r.ventas || 0) * (r.comision || 0)) / 100;
        const totalPago = (r.sueldoBase || 0) + qComision;

        return (
          <div
            key={r.id}
            className={`grid ${COLS}`}
            style={{
              background:
                rowIdx % 2 === 0 ? THEME.stripeAlt : THEME.stripe,
            }}
          >
            <Cell>{r.id}</Cell>
            <Cell strong>
              <button
                onClick={() => openForm(r)}
                className="max-w-[260px] truncate underline-offset-2 hover:underline transition text-left"
                style={{ color: THEME.accentBlue }}
                title="Ver/editar datos del vendedor"
              >
                {r.nombre}
              </button>
            </Cell>
            <Cell align="right">{fmtQ(r.sueldoBase)}</Cell>
            <Cell align="right">{fmtQ(qComision)}</Cell>
            <Cell align="right" strong>
              {fmtQ(totalPago)}
            </Cell>
            <Cell align="right">{r.comision ? `${r.comision}%` : ""}</Cell>
            <Cell align="center">{r.cierres}</Cell>
            <Cell align="center">
              <div className="flex items-center justify-between w-full px-2">
                <span className="font-medium tabular-nums text-gray-800">
                  {r.efectividad}%
                </span>
                <div className="flex justify-end w-5">
                  <div
                    className={`w-3 h-3 rounded-full ${getColor(
                      r.efectividad
                    )}`}
                    title={`Efectividad: ${r.efectividad}%`}
                  />
                </div>
              </div>
            </Cell>
          </div>
        );
      })}

      {/* Footer fijo */}
      <div
        className={`grid ${COLS} sticky bottom-0 z-10`}
        style={{
          borderTop: `1px solid ${THEME.border}`,
          background: THEME.header,
        }}
      >
        <div
          className="px-4 py-3 font-semibold text-white col-span-2 rounded-bl-3xl"
          style={{ borderRight: `1px solid ${THEME.border}` }}
        >
          {totalEmpleados} Empleados
        </div>
        <div
          className="px-4 py-3 font-semibold text-right text-white"
          style={{ borderRight: `1px solid ${THEME.border}` }}
        >
          {fmtQ(sumaSueldoBase)}
        </div>
        <div
          className="px-4 py-3 font-semibold text-right text-white"
          style={{ borderRight: `1px solid ${THEME.border}` }}
        >
          {fmtQ(sumaQComision)}
        </div>
        <div
          className="px-4 py-3 font-semibold text-right text-white"
          style={{ borderRight: `1px solid ${THEME.border}` }}
        >
          {fmtQ(sumaTotalPago)}
        </div>
        <div
          className="px-4 py-3 font-semibold text-right text-white"
          style={{ borderRight: `1px solid ${THEME.border}` }}
        >
          {promComision.toFixed(2)}%
        </div>
        <div
          className="px-4 py-3 font-semibold text-center text-white"
          style={{ borderRight: `1px solid ${THEME.border}` }}
        >
          {sumaCierres.toFixed(2)}
        </div>
        <div
          className="px-4 py-3 font-semibold text-center text-white rounded-br-3xl"
        >
          {promEfectividad.toFixed(2)}%
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Modal */}
      <ModalBase open={!!selected} title={selected ? `Datos adicionales — ${selected.nombre}` : ""} onClose={closeForm}>
        <FormAgentes formData={formData} onChange={handleChange} onSave={handleSave} onCancel={closeForm} />
      </ModalBase>
    </div>
  );
}
