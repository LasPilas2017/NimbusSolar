import React from "react";
import THEME from "../theme"; // export default

/* ========= Helpers ========= */
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

/* ========= Datos EXACTOS que pediste ========= */
const DATA = [
  {
    id: "I2025106",
    nombre: "ANALÍ ESMERALDA RAMOS DE CHACAT",
    empresa: "CLARO",
    correo: "j.lopez@gmail.com",
    telefono: "8346458111",
    celular: "8119187047",
    direccion: "Gavilanes #222",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
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
    direccion: "zONA 9",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
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
    municipio: "—",
    segmento: "Domiciliar",
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
    municipio: "—",
    segmento: "Domiciliar",
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
    municipio: "—",
    segmento: "Domiciliar",
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
    municipio: "—",
    segmento: "Domiciliar",
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
    municipio: "—",
    segmento: "Domiciliar",
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
    municipio: "—",
    segmento: "Domiciliar",
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
    municipio: "—",
    segmento: "Domiciliar",
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
    municipio: "—",
    segmento: "Domiciliar",
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
];

/* ========= Componente ========= */
export default function Diseno() {
  // orden y anchos como Excel (14 columnas)
  const COLS =
    "grid-cols-[110px,320px,220px,230px,140px,140px,260px,170px,170px,160px,160px,180px,150px,170px]";

  const totalClientes = DATA.length;
  const totalCompras = DATA.reduce((a, r) => a + (r.compras || 0), 0);

  const handleDotClick = (row) => {
    // aquí conectas tu función real (modal, navegación, etc.)
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
        <div className={`min-w-[1600px] grid ${COLS}`}>
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
            "Fecha de Creación", // entre Segmento y Días Último Contacto
            "Días Último Contacto",
            "Estado",
            "Compras",
          ].map((h, i, all) => (
            <div
              key={h}
              className="px-4 py-3 font-bold"
              style={{
                background: THEME.headerDark,
                color: THEME.headerText,
                borderRight:
                  i === all.length - 1 ? "none" : `1px solid rgba(255,255,255,.32)`,
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
        <div className="relative min-w-[1600px]" style={{ background: THEME.stripeAlt }}>
          {DATA.map((r, idx) => {
            const bg = idx % 2 === 0 ? THEME.stripeAlt : THEME.stripeALT;
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
                <Cell>{r.fecha || "-"}</Cell> {/* Fecha aquí */}
                <Cell align="center">{r.dias ?? "N/A"}</Cell>

                {/* Estado centrado */}
                <Cell align="center">
                  <BadgeEstado estado={r.estado} />
                </Cell>

                {/* Compras: punto IZQ + monto DER */}
                <Cell rightBorder={false}>
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
            {/* Ocupa de ID a "Días Último Contacto" (12 columnas) */}
            <div
                className="px-4 py-3 font-bold text-white col-span-12"
                style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            >
                {totalClientes} Clientes
            </div>

            {/* Columna de Estado (vacía) */}
            <div
                className="px-4 py-3 font-bold text-center text-white"
                style={{ background: THEME.header, borderRight: `1px solid ${THEME.border}` }}
            />

            {/* Última columna: Compras (total) */}
            <div
                className="px-4 py-3 font-bold text-right text-white"
                style={{ background: THEME.header }}
            >
                {fmtQ(totalCompras)}
            </div>
            </div>

        </div>
      </div>
    </div>
  );
}
