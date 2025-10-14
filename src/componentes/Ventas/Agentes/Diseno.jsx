import React from "react";
import THEME from "../theme"; 
import { useState, useMemo } from "react";
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
// Formato Q
const fmtQ = (n) =>
  `Q${(n ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Celda reutilizable
function Cell({ children, strong, align = "left" }) {
  return (
    <div
      className={`px-4 py-2.5 text-gray-900 whitespace-nowrap ${
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

// Modal simple
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4" style={{ background: THEME.header, color: THEME.headerText }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm"
              style={{ background: THEME.headerDark, color: THEME.headerText }}
            >
              ✕
            </button>
          </div>
        </div>
        <div className="bg-white p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Diseno() {
  // Estado modal
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(null);

  // Cálculos
  const totalEmpleados = DATA.length;
  const promComision = useMemo(
    () => (totalEmpleados ? DATA.reduce((a, r) => a + (r.comision || 0), 0) / totalEmpleados : 0),
    [totalEmpleados]
  );
  const sumaCierres = useMemo(() => DATA.reduce((a, r) => a + (r.cierres || 0), 0), []);
  const promEfectividad = useMemo(
    () => (totalEmpleados ? DATA.reduce((a, r) => a + (r.efectividad || 0), 0) / totalEmpleados : 0),
    [totalEmpleados]
  );
  const sumaTotalPago = useMemo(
    () =>
      DATA.reduce(
        (a, r) => a + ((r.sueldoBase || 0) + ((r.ventas || 0) * (r.comision || 0)) / 100),
        0
      ),
    []
  );

  // ⚠️ IMPORTANTE: usar espacios (con _ ) en grid-template-columns
  // ID | Nombre | Sueldo Base | Q. Comisión | Total Pago | % Comisión | Cierres | Efectividad
  const COLS = "grid-cols-[80px_280px_150px_150px_160px_130px_110px_170px]";
  const TABLE_MIN_W = "min-w-[1230px]"; // 80+280+150+150+160+130+110+170

  // Color círculo efectividad
  const getColor = (ef) => {
    if (ef >= 95 && ef <= 100) return "bg-green-500";
    if (ef >= 60 && ef <= 94) return "bg-yellow-400";
    return "bg-red-500";
  };

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
    // TODO: guardar en Supabase/API
    console.log("Guardar:", { id: selected?.id, ...formData });
    closeForm();
  };

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

      {/* Tabla */}
      <div className="w-full border border-gray-400 shadow overflow-x-auto" style={{ background: THEME.stripeAlt }}>
        {/* Encabezado */}
        <div className={`${TABLE_MIN_W} grid ${COLS} sticky top-0 z-10`} style={{ borderBottom: `1px solid ${THEME.border}` }}>
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
              className="px-4 py-3 font-bold whitespace-nowrap"
              style={{
                background: THEME.headerDark,
                color: THEME.headerText,
                borderRight: idx === arr.length - 1 ? "none" : "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <span>{h}</span>
                <span className="ml-2 text-[10px] opacity-90">▾</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cuerpo */}
        <div className={`${TABLE_MIN_W}`} style={{ background: THEME.stripe }}>
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

                {/* Nombre clickeable */}
                <Cell strong>
                  <button
                    onClick={() => openForm(r)}
                    className="max-w-[260px] truncate text-blue-700 underline hover:text-blue-900 transition"
                    title="Ver/editar datos del vendedor"
                  >
                    {r.nombre}
                  </button>
                </Cell>

                <Cell align="right"><span className="tabular-nums">{fmtQ(r.sueldoBase)}</span></Cell>
                <Cell align="right"><span className="tabular-nums">{fmtQ(qComision)}</span></Cell>
                <Cell align="right" strong><span className="tabular-nums">{fmtQ(totalPago)}</span></Cell>
                <Cell align="right"><span className="tabular-nums">{r.comision ? `${r.comision}%` : ""}</span></Cell>
                <Cell align="center"><span className="tabular-nums">{r.cierres}</span></Cell>

                {/* Efectividad */}
                <Cell align="center">
                  <div className="flex items-center justify-between w-full px-2">
                    <span className="text-gray-800 font-medium tabular-nums">{r.efectividad}%</span>
                    <div className="flex justify-end w-5">
                      <div className={`w-3 h-3 rounded-full ${getColor(r.efectividad)}`} title={`Efectividad: ${r.efectividad}%`} />
                    </div>
                  </div>
                </Cell>
              </div>
            );
          })}

          {/* Footer */}
          <div className={`grid ${COLS}`}>
            {/* ID+Nombre (2 columnas) */}
            <div
              className="px-4 py-3 font-bold text-white col-span-2"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {totalEmpleados} Empleados
            </div>

            {/* Sueldo Base (vacío) */}
            <div className="px-4 py-3 font-bold text-white" style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }} />

            {/* Q. Comisión (sin total) */}
            <div className="px-4 py-3 font-bold text-white" style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }} />

            {/* Total Pago general */}
            <div
              className="px-4 py-3 font-bold text-right text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {fmtQ(sumaTotalPago)}
            </div>

            {/* % Comisión (promedio) */}
            <div
              className="px-4 py-3 font-bold text-right text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {DATA.reduce((a, r) => a + (r.comision || 0), 0).toFixed(2)}%

            </div>

            {/* Cierres (suma) */}
            <div
              className="px-4 py-3 font-bold text-center text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              <span className="tabular-nums">{sumaCierres.toFixed(2)}</span>
            </div>

            {/* Efectividad (promedio) */}
            <div className="px-4 py-3 font-bold text-center text-white" style={{ background: THEME.header }}>
              {promEfectividad.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Modal con campos ocultos */}
      <Modal
        open={!!selected}
        title={selected ? `Datos adicionales — ${selected.nombre}` : ""}
        onClose={closeForm}
      >
        {formData && (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
              <input type="text" name="dpi" value={formData.dpi} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring" placeholder="###########" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <textarea name="direccion" value={formData.direccion} onChange={handleChange} rows={3} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring" />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg border">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-white" style={{ background: THEME.header }}>Guardar</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}