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
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(null);

  // ===== Cálculos base
  const totalEmpleados = useMemo(() => DATA.length, [DATA]);

  const promComision = useMemo(
    () =>
      DATA.length
        ? DATA.reduce((a, r) => a + (r.comision || 0), 0) / DATA.length
        : 0,
    [DATA]
  );

  const sumaCierres = useMemo(
    () => DATA.reduce((a, r) => a + (r.cierres || 0), 0),
    [DATA]
  );

  const promEfectividad = useMemo(
    () =>
      DATA.length
        ? DATA.reduce((a, r) => a + (r.efectividad || 0), 0) / DATA.length
        : 0,
    [DATA]
  );

  // ===== Totales requeridos
  const sumaSueldoBase = useMemo(
    () => DATA.reduce((a, r) => a + (r.sueldoBase || 0), 0),
    [DATA]
  );

  const sumaQComision = useMemo(
    () =>
      DATA.reduce(
        (a, r) => a + (((r.ventas || 0) * (r.comision || 0)) / 100),
        0
      ),
    [DATA]
  );

  const sumaTotalPago = useMemo(
    () =>
      DATA.reduce(
        (a, r) =>
          a +
          ((r.sueldoBase || 0) + ((r.ventas || 0) * (r.comision || 0)) / 100),
        0
      ),
    [DATA]
  );

  // ===== Columnas (usar underscores en grid-template)
  // ID | Nombre | Sueldo Base | Q. Comisión | Total Pago | % Comisión | Cierres | Efectividad
  const COLS = "grid-cols-[80px_280px_150px_150px_160px_130px_110px_170px]";
  const TABLE_MIN_W = "min-w-[1230px]";

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
  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSave = (e) => {
    e.preventDefault();
    // TODO: guardar en Supabase/API
    console.log("Guardar:", { id: selected?.id, ...formData });
    closeForm();
  };

  return (
    <div
      className="w-full min-h-screen px-6 pb-12"
      style={{ background: THEME.background }}
    >
      {/* ===== Título y divider elegante */}
      <div className="flex items-center gap-3 mt-6 mb-3">
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
        style={{
          background: `linear-gradient(90deg, ${THEME.headerDark}, ${THEME.header}, ${THEME.headerLight})`,
        }}
      />

      {/* ===== Tabla en tarjeta con bordes redondos + sombra suave */}
      <div
        className="w-full overflow-x-auto rounded-3xl shadow-lg ring-1"
        style={{ background: THEME.surface }}
      >
        {/* Encabezado fijo con gradiente y bordes sutiles */}
        <div
          className={`${TABLE_MIN_W} grid ${COLS} sticky top-0 z-10`}
          style={{ borderBottom: `1px solid ${THEME.border}` }}
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
                background: `linear-gradient(180deg, ${THEME.headerDark}, ${THEME.header})`,
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

        {/* Cuerpo con franjas suaves y bordes discretos */}
        <div className={`${TABLE_MIN_W}`}>
          {DATA.map((r, rowIdx) => {
            const qComision = ((r.ventas || 0) * (r.comision || 0)) / 100;
            const totalPago = (r.sueldoBase || 0) + qComision;

            return (
              <div
                key={r.id}
                className={`grid ${COLS}`}
                style={{
                  background: rowIdx % 2 === 0 ? THEME.stripeAlt : THEME.stripe,
                  borderBottom: `1px solid ${THEME.border}`,
                }}
              >
                <Cell>{r.id}</Cell>

                {/* Nombre clickeable con estilo pro */}
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

                <Cell align="right">
                  <span className="tabular-nums">{fmtQ(r.sueldoBase)}</span>
                </Cell>
                <Cell align="right">
                  <span className="tabular-nums">{fmtQ(qComision)}</span>
                </Cell>
                <Cell align="right" strong>
                  <span className="tabular-nums">{fmtQ(totalPago)}</span>
                </Cell>
                <Cell align="right">
                  <span className="tabular-nums">
                    {r.comision ? `${r.comision}%` : ""}
                  </span>
                </Cell>
                <Cell align="center">
                  <span className="tabular-nums">{r.cierres}</span>
                </Cell>

                {/* Efectividad con punto de estado */}
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

          {/* Footer resumido con fondo corporativo + línea superior sutil */}
          <div
            className={`grid ${COLS}`}
            style={{ borderTop: `1px solid ${THEME.border}` }}
          >
            {/* ID+Nombre (2 columnas) */}
            <div
              className="px-4 py-3 font-semibold text-white col-span-2 rounded-bl-3xl"
              style={{
                background: THEME.header,
                borderRight: `1px solid ${THEME.border}`,
              }}
            >
              {totalEmpleados} Empleados
            </div>

            {/* Total Sueldo Base */}
            <div
              className="px-4 py-3 font-semibold text-right text-white"
              style={{
                background: THEME.header,
                borderRight: `1px solid ${THEME.border}`,
              }}
              title="Suma total de Sueldo Base"
            >
              <span className="tabular-nums">{fmtQ(sumaSueldoBase)}</span>
            </div>

            {/* Total Q. Comisión */}
            <div
              className="px-4 py-3 font-semibold text-right text-white"
              style={{
                background: THEME.header,
                borderRight: `1px solid ${THEME.border}`,
              }}
              title="Suma total de Q. Comisión"
            >
              <span className="tabular-nums">{fmtQ(sumaQComision)}</span>
            </div>

            {/* Total Pago general */}
            <div
              className="px-4 py-3 font-semibold text-right text-white"
              style={{
                background: THEME.header,
                borderRight: `1px solid ${THEME.border}`,
              }}
              title="Suma total de Total Pago"
            >
              <span className="tabular-nums">{fmtQ(sumaTotalPago)}</span>
            </div>

            {/* % Comisión (promedio simple) */}
            <div
              className="px-4 py-3 font-semibold text-right text-white"
              style={{
                background: THEME.header,
                borderRight: `1px solid ${THEME.border}`,
              }}
              title="Promedio simple de % comisión"
            >
              {promComision.toFixed(2)}%
            </div>

            {/* Cierres (suma) */}
            <div
              className="px-4 py-3 font-semibold text-center text-white"
              style={{
                background: THEME.header,
                borderRight: `1px solid ${THEME.border}`,
              }}
              title="Suma total de cierres"
            >
              <span className="tabular-nums">{sumaCierres.toFixed(2)}</span>
            </div>

            {/* Efectividad (promedio) */}
            <div
              className="px-4 py-3 font-semibold text-center text-white rounded-br-3xl"
              style={{ background: THEME.header }}
              title="Promedio de efectividad"
            >
              {promEfectividad.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* ===== Modal con formulario separado */}
      <ModalBase
        open={!!selected}
        title={selected ? `Datos adicionales — ${selected.nombre}` : ""}
        onClose={closeForm}
      >
        <FormAgentes
          formData={formData}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={closeForm}
        />
      </ModalBase>
    </div>
  );
}