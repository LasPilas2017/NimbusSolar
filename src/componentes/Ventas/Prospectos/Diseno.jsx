import React, { useState } from "react";
import THEME from "../theme"; // export default


/* ================ DATA ================= */
const DATA = [
  {
    id: "I2025106",
    fecha: "2024-10-02",
    nombre: "ANALÍ ESMERALDA RAMOS DE CHACAT",
    empresa: "CLARO",
    correo: "j.lopez@gmail.com",
    telefono: "8346458111",
    celular: "8119187047",
    direccion: "Gavilanes #222",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Atada a la red",
    promedioKW: 78,
    promedioQ: 350,
    dias: 39,
    estado: "Venta",
    compras: 4000,
  },
  {
    id: "I2025108",
    fecha: "2024-10-02",
    nombre: "JOSÉ MIGUEL REYES RAMÍREZ",
    empresa: "TIGO",
    correo: "ck",
    telefono: "4444",
    celular: "44",
    direccion: "Zona 9",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Atada a la red",
    promedioKW: 54,
    promedioQ: 125,
    dias: 9,
    estado: "Venta",
    compras: 5000,
  },
  {
    id: "I2025110",
    fecha: "2024-10-02",
    nombre: "EDWIN GUSTAVO TZIBOY CHOC",
    empresa: "CABLEADO S.A",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "Guatemala Final",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Atada a la red",
    promedioKW: 375,
    promedioQ: 525,
    dias: 9,
    estado: "Venta",
    compras: 3000,
  },
  {
    id: "I2025112",
    fecha: "2024-10-02",
    nombre: "JOSÉ OSWALDO CHAVAC GARCÍA",
    empresa: "VENTAS TOTALES",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "Zona 0",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Aislada",
    promedioKW: 28,
    promedioQ: 100,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "I2025114",
    fecha: "2024-10-02",
    nombre: "ENGELVER ARIOBALDO GARCIA GARCÍA",
    empresa: "REPUESTOS S.A",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Aislada",
    promedioKW: 28,
    promedioQ: 100,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025106",
    fecha: "2024-10-02",
    nombre: "MARCO TULIO LOPEZ  PEREZ",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025107",
    fecha: "2024-10-02",
    nombre: "LESVER FERNANDO LOPEZ SOC",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "FLORES",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025108",
    fecha: "2024-10-02",
    nombre: "CAROLAY YOMARA SAGASTUME GONZALEZ",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025109",
    fecha: "2024-10-02",
    nombre: "ALFREDO SACUL CHOC",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025110",
    fecha: "2024-10-02",
    nombre: "JACQUELINE JULISSA CABRERA LOARCA",
    empresa: "CA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025111",
    fecha: "2024-10-02",
    nombre: "MIRSA CAROLINA GOMEZ HERNANDEZ",
    empresa: "CA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "FLORES",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025112",
    fecha: "2024-10-02",
    nombre: "JONATHAN ISAIAS IXCOY QUINTANAL",
    empresa: "CA",
    correo: "",
    telefono: "",
    celular: "",
    direccion: "",
    departamento: "ESCUINTLA",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025113",
    fecha: "2024-10-02",
    nombre: "ESTUARD CANIZALES ALVAREZ",
    empresa: "CASA",
    correo: "",
    telefono: "",
    celular: "",
    direccion: "",
    departamento: "ESCUINTLA",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
];

/* ================= Helpers ================ */
const fmtQ = (n) =>
  n == null || n === ""
    ? "-"
    : `Q${Number(n).toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

function BadgeEstado({ estado }) {
  const isVenta = (estado || "").toLowerCase() === "venta";
  const color = isVenta ? "#1a9a50" : "#2563eb";
  const bg = isVenta ? "rgba(26,154,80,.12)" : "rgba(37,99,235,.12)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 8,
        fontWeight: 700,
        color,
        background: bg,
        border: `1px solid ${isVenta ? "rgba(26,154,80,.35)" : "rgba(37,99,235,.35)"}`,
      }}
    >
      {estado || "-"}
    </span>
  );
}

function DotCompra({ valor, onClick }) {
  let fill = "#8a929e"; // gris
  if (valor > 0 && valor < 4000) fill = "#eab308"; // amarillo
  if (valor >= 4000) fill = "#16a34a"; // verde
  return (
    <button
      onClick={onClick}
      title="Detalle de compra"
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: fill,
        border: `1px solid ${THEME.border}`,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,.6)",
      }}
      aria-label="indicador de compras"
    />
  );
}

function Cell({ children, strong, align = "left", rightBorder = true }) {
  return (
    <div
      className={`px-4 py-2.5 text-gray-900 ${
        strong ? "font-semibold" : ""
      } ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}
      style={{
        borderRight: rightBorder ? `2px solid ${THEME.border}` : "none",
        borderBottom: `2px solid ${THEME.border}`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </div>
  );
}

// Modal genérico
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4" style={{ background: THEME.header, color: THEME.headerText }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
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

/* ====== Semilla de 5 contactos (incluye TIPO) ====== */
function seedContactos(row) {
  const bases = [
    { canal: "WhatsApp", tipo: "Entrante", comentario: "Se compartió brochure y cotización preliminar." },
    { canal: "Llamada",  tipo: "Saliente", comentario: "Pidió detalles de garantía y tiempos." },
    { canal: "Correo",   tipo: "Saliente", comentario: "Se envió propuesta formal con despiece." },
    { canal: "WhatsApp", tipo: "Entrante", comentario: "Confirmó recepción; revisará con gerencia." },
    { canal: "Llamada",  tipo: "Saliente", comentario: "Agendó visita técnica para levantamiento." },
  ];
  const today = new Date();
  return bases.map((b, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (i + ((row.id?.charCodeAt(0) ?? 0) % 3)));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return { fecha: `${y}-${m}-${day}`, canal: b.canal, tipo: b.tipo, comentario: b.comentario };
  });
}

/* ====== Utilidad: última fecha de venta ====== */
function getUltimaFechaVenta(r) {
  // Si viene un historial explícito, tomar la fecha más reciente
  if (Array.isArray(r.ventasHistorial) && r.ventasHistorial.length > 0) {
    // Se espera [{ fecha: "YYYY-MM-DD", monto: number, ...}, ...]
    const fechas = r.ventasHistorial
      .map((v) => v.fecha)
      .filter(Boolean)
      .sort(); // orden lexicográfico funciona con YYYY-MM-DD
    return fechas[fechas.length - 1] || "-";
  }
  // Si no hay historial pero hay compras > 0, usar la "fecha" del registro
  if ((r.compras || 0) > 0) return r.fecha || "-";
  // Sin ventas conocidas
  return "-";
}

/* =============== Componente principal =============== */
export default function Diseno() {
  // 18 columnas (se agregó "Última Fecha de Venta" antes de "Compras")
  const COLS =
    "grid-cols-[110px,320px,220px,230px,140px,140px,260px,170px,170px,160px,160px,160px,160px,160px,180px,150px,160px,170px]";

  const totalClientes = DATA.length;
  const totalCompras = DATA.reduce((a, r) => a + (r.compras || 0), 0);

  // Estado del modal de contactos
  const [openRow, setOpenRow] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [nuevo, setNuevo] = useState({
    fecha: "",
    canal: "WhatsApp",
    tipo: "Entrante",
    comentario: "",
  });

  // Estado del modal de ventas (historial)
  const [openVentasRow, setOpenVentasRow] = useState(null);

  const abrirContactos = (row) => {
    setOpenRow(row);
    const list =
      Array.isArray(row.contactos) && row.contactos.length > 0
        ? row.contactos
        : seedContactos(row);
    setContactos(list);
    setNuevo({ fecha: "", canal: "WhatsApp", tipo: "Entrante", comentario: "" });
  };

  const cerrarContactos = () => {
    setOpenRow(null);
    setContactos([]);
  };

  const abrirVentas = (row) => {
    setOpenVentasRow(row);
  };

  const cerrarVentas = () => {
    setOpenVentasRow(null);
  };

  const handleAddContacto = (e) => {
    e.preventDefault();
    if (!nuevo.fecha || !nuevo.canal || !nuevo.tipo || !nuevo.comentario) return;
    setContactos((prev) => [
      { fecha: nuevo.fecha, canal: nuevo.canal, tipo: nuevo.tipo, comentario: nuevo.comentario },
      ...prev,
    ]);
    setNuevo({ fecha: "", canal: "WhatsApp", tipo: "Entrante", comentario: "" });
  };

  const handleDotClick = (row) => {
    console.log("Detalle compras:", row.id, row.nombre, row.compras);
  };

  return (
    <div className="w-full min-h-screen px-6 pb-10">
      {/* Título */}
      <div className="flex items-center gap-3 mt-2 mb-2">
        <div className="text-5xl leading-none">🗂️</div>
        <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">
          Catálogo de Prospectos
        </h1>
      </div>
      <div className="h-[4px] w-full bg-gray-800 mb-4" />

      {/* Tabla */}
      <div
        className="w-full border shadow overflow-x-auto"
        style={{ background: THEME.stripeAlt, borderColor: THEME.border }}
      >
        {/* Encabezado */}
        <div className={`min-w-[2110px] grid ${COLS}`}>
          {[
            "ID",
            "Nombre Completo",
            "Empresa",
            "Correo Electrónico",
            "Teléfono",
            "Celular",
            "Dirección",
            "Departamento",
            "Municipio",
            "Segmento",
            "Tipo de Instalación",
            "Promedio / kW",
            "Promedio / Q",
            "Fecha de Creación",
            "Días Último Contacto",
            "Estado",
            "Última Fecha de Venta", // 🆕
            "Compras",
          ].map((h, i, all) => (
            <div
              key={h}
              className="px-4 py-3 font-bold"
              style={{
                background: THEME.headerDark,
                color: THEME.headerText,
                borderRight: i === all.length - 1 ? "none" : `1px solid rgba(255,255,255,.32)`,
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
        <div className="relative min-w-[2110px]" style={{ background: THEME.stripeAlt }}>
          {DATA.map((r, idx) => {
            const bg = idx % 2 === 0 ? THEME.stripeAlt : THEME.stripe;
            const ultimaVenta = getUltimaFechaVenta(r);

            return (
              <div
                key={r.id}
                className={`grid ${COLS}`}
                style={{ background: bg, borderBottom: `1px solid ${THEME.border}` }}
              >
                <Cell>{r.id}</Cell>
                <Cell strong>{r.nombre}</Cell>
                <Cell>{r.empresa || "-"}</Cell>
                <Cell>
                  {r.correo && r.correo.includes("@") ? (
                    <a className="text-blue-700 underline" href={`mailto:${r.correo}`}>
                      {r.correo}
                    </a>
                  ) : (
                    r.correo || "-"
                  )}
                </Cell>
                <Cell>{r.telefono || "-"}</Cell>
                <Cell>{r.celular || "-"}</Cell>
                <Cell>{r.direccion || "-"}</Cell>
                <Cell>{r.departamento || "-"}</Cell>
                <Cell>{r.municipio || "-"}</Cell>
                <Cell>{r.segmento || "-"}</Cell>
                <Cell>{r.tipoInstalacion || "-"}</Cell>
                <Cell align="right">{r.promedioKW ? `${r.promedioKW} kW` : "-"}</Cell>
                <Cell align="right">{r.promedioQ ? fmtQ(r.promedioQ) : "-"}</Cell>
                <Cell>{r.fecha || "-"}</Cell>

                {/* Días Último Contacto + Lupa */}
                <Cell align="center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="tabular-nums">{r.dias ?? "N/A"}</span>
                    <button
                      type="button"
                      onClick={() => abrirContactos(r)}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Ver registro de contactos"
                    >
                      {/* Ícono lupa */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </button>
                  </div>
                </Cell>

                {/* Estado */}
                <Cell align="center">
                  <BadgeEstado estado={r.estado} />
                </Cell>

                {/* 🆕 Última Fecha de Venta + Lupa ventas */}
                <Cell align="center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="tabular-nums">{ultimaVenta}</span>
                    <button
                      type="button"
                      onClick={() => abrirVentas(r)}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Ver historial de ventas"
                    >
                      {/* Ícono lupa */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </button>
                  </div>
                </Cell>

                {/* Compras */}
                <Cell>
                  <div className="flex items-center justify-between">
                    <DotCompra valor={r.compras} onClick={() => handleDotClick(r)} />
                    <span className="font-semibold text-gray-900">{fmtQ(r.compras)}</span>
                  </div>
                </Cell>
              </div>
            );
          })}

          {/* Fila totals */}
          <div className={`grid ${COLS}`}>
            {/* Ocupa de ID a Días Último Contacto (15 columnas) */}
            <div
              className="px-4 py-3 font-bold text-white col-span-15"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
              {totalClientes} Clientes
            </div>

            {/* Estado (vacía) */}
            <div
              className="px-4 py-3 font-bold text-center text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            />

            {/* Última Fecha de Venta (vacía) */}
            <div
              className="px-4 py-3 font-bold text-center text-white"
              style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            />

            {/* Compras (total) */}
            <div
              className="px-4 py-3 font-bold text-right text-white"
              style={{ background: THEME.header }}
            >
              {fmtQ(totalCompras)}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Registro de Contactos */}
      <Modal
        open={!!openRow}
        onClose={cerrarContactos}
        title={openRow ? `Registro de contactos — ${openRow.nombre}` : ""}
      >
        {/* Formulario para agregar */}
        <form onSubmit={handleAddContacto} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              value={nuevo.fecha}
              onChange={(e) => setNuevo((p) => ({ ...p, fecha: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
            <select
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              value={nuevo.canal}
              onChange={(e) => setNuevo((p) => ({ ...p, canal: e.target.value }))}
              required
            >
              <option>WhatsApp</option>
              <option>Llamada</option>
              <option>Correo</option>
              <option>Visita</option>
            </select>
          </div>

          {/* Tipo de comunicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de comunicación</label>
            <select
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              value={nuevo.tipo}
              onChange={(e) => setNuevo((p) => ({ ...p, tipo: e.target.value }))}
              required
            >
              <option>Entrante</option>
              <option>Saliente</option>
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
              placeholder="Ej. Cliente solicita comparar inversores de 5kW y 8kW…"
              value={nuevo.comentario}
              onChange={(e) => setNuevo((p) => ({ ...p, comentario: e.target.value }))}
              required
            />
          </div>

          <div className="md:col-span-4 flex items-center justify-end gap-2">
            <button type="button" onClick={cerrarContactos} className="px-4 py-2 rounded-lg border">
              Cerrar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: THEME.header }}
            >
              Agregar contacto
            </button>
          </div>
        </form>

        {/* Lista de registros */}
        <div className="border rounded-xl overflow-hidden">
          <div
            className="grid grid-cols-[140px_200px_1fr] font-semibold text-white"
            style={{ background: THEME.header }}
          >
            <div className="px-3 py-2">Fecha</div>
            <div className="px-3 py-2">Canal</div>
            <div className="px-3 py-2">Comentario</div>
          </div>
          <div>
            {contactos.map((c, i) => {
              const isEntrante = (c.tipo || "").toLowerCase() === "entrante";
              const arrowColor = isEntrante ? "#16a34a" : "#dc2626"; // verde / rojo
              const arrowPath = isEntrante
                ? "M12 5v10m0 0l-4-4m4 4l4-4" // flecha abajo
                : "M12 19V9m0 0l4 4m-4-4l-4 4"; // flecha arriba
              return (
                <div
                  key={i}
                  className="grid grid-cols-[140px_200px_1fr]"
                  style={{
                    borderTop: `1px solid ${THEME.border}`,
                    background: i % 2 ? THEME.stripe : THEME.stripeAlt,
                  }}
                >
                  <div className="px-3 py-2 tabular-nums">{c.fecha}</div>
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {c.canal}
                      </span>
                      {/* Flecha tipo comunicación */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        stroke={arrowColor}
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        title={c.tipo || ""}
                      >
                        <path d={arrowPath} />
                      </svg>
                    </div>
                  </div>
                  <div className="px-3 py-2">{c.comentario}</div>
                </div>
              );
            })}
            {contactos.length === 0 && (
              <div className="px-3 py-6 text-center text-gray-500">Sin registros aún.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal: Historial de Ventas (Próximamente) */}
      <Modal
        open={!!openVentasRow}
        onClose={cerrarVentas}
        title={openVentasRow ? `Historial de ventas — ${openVentasRow.nombre}` : ""}
      >
        <div className="rounded-xl border p-6 text-center text-gray-600">
          <div className="text-xl font-semibold mb-2">Próximamente</div>
          <p>
            Aquí verás el detalle de ventas por fecha, monto y observación. 
            Estamos preparando este módulo para ti. 🚧
          </p>
        </div>
      </Modal>
    </div>
  );
}
