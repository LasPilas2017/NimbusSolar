import React from "react";
import { ChevronDown } from "lucide-react";

/**
 * Tabla de Prospección
 * - Encabezados agrupados como en tu diseño (bandas de color)
 * - Header sticky, zebra, y scroll horizontal si hace falta
 * - Columnas: ID, Prospecto, Condición, Agente, Canal, Fecha1..Fecha5, Días, Avance, Estatus, Venta, Notas
 *
 * Props:
 *  rows: array de objetos con las llaves abajo
 *  onRowClick?: (row) => void
 */
export default function CRMTablaProspectos({ rows = [], onRowClick }) {
  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-3">
      {/* Encabezados agrupados */}
      <div className="hidden xl:grid xl:grid-cols-[220px_240px_480px_420px] gap-2 mb-2">
        <GroupHeader color="#1976D2" title="Información de Prospecto" />
        <GroupHeader color="#7341B2" title="Información de Prospección" />
        <div className="grid grid-cols-5 gap-2">
          <GroupHeader color="#9B1B17" title="Contacto" />
          <GroupHeader color="#D97706" title="Cita" />
          <GroupHeader color="#EAB308" title="Candidato" />
          <GroupHeader color="#4CAF50" title="Cotización" />
          <GroupHeader color="#1FA15D" title="Cierre" />
        </div>
        <GroupHeader color="#1565C0" title="Evaluación de Prospección" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="sticky top-0 z-10">
            {/* fila de títulos */}
            <tr className="bg-[#EAF2FB] text-gray-900">
              <Th>ID</Th>
              <Th>Prospecto</Th>
              <Th>Condición</Th>
              <Th className="bg-[#EEE8F8]">Agente</Th>
              <Th className="bg-[#EEE8F8]">Canal</Th>

              <Th className="bg-[#FBE9EA]">
                <div className="flex items-center gap-1">
                  Fecha 1 <ChevronDown size={14} />
                </div>
              </Th>
              <Th className="bg-[#FEF0D9]">
                <div className="flex items-center gap-1">
                  Fecha 2 <ChevronDown size={14} />
                </div>
              </Th>
              <Th className="bg-[#FFF7D1]">
                <div className="flex items-center gap-1">
                  Fecha 3 <ChevronDown size={14} />
                </div>
              </Th>
              <Th className="bg-[#E3F4E6]">
                <div className="flex items-center gap-1">
                  Fecha 4 <ChevronDown size={14} />
                </div>
              </Th>
              <Th className="bg-[#DFF5EA]">
                <div className="flex items-center gap-1">
                  Fecha 5 <ChevronDown size={14} />
                </div>
              </Th>

              <Th>Días</Th>
              <Th>Avance</Th>
              <Th>Estatus</Th>
              <Th>Venta</Th>
              <Th>Notas</Th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                  {Array.from({ length: 16 }).map((__, j) => (
                    <td key={j} className="px-3 py-3 text-center text-red-500/70">
                      {j === 0 ? "0" : ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              rows.map((r, i) => (
                <tr
                  key={r.id ?? i}
                  onClick={() => onRowClick?.(r)}
                  className={`transition ${
                    i % 2 ? "bg-white" : "bg-[#FAFAFA]"
                  } hover:bg-blue-50 cursor-pointer`}
                >
                  <Td>{r.id}</Td>
                  <Td left>{r.prospecto}</Td>
                  <Td>{r.condicion}</Td>
                  <Td>{r.agente}</Td>
                  <Td>{r.canal}</Td>

                  <Td>{fmt(r.fecha1)}</Td>
                  <Td>{fmt(r.fecha2)}</Td>
                  <Td>{fmt(r.fecha3)}</Td>
                  <Td>{fmt(r.fecha4)}</Td>
                  <Td>{fmt(r.fecha5)}</Td>

                  <Td>{r.dias}</Td>
                  <Td>{r.avance}</Td>
                  <Td>{r.estatus}</Td>
                  <Td>{r.venta ? "Sí" : "No"}</Td>
                  <Td left className="max-w-[280px] truncate" title={r.notas}>
                    {r.notas}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function GroupHeader({ color, title }) {
  return (
    <div
      className="rounded-md px-3 py-1 text-white text-[13px] font-semibold tracking-wide"
      style={{ background: color }}
    >
      {title}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-2 font-semibold text-[13px] text-left border-b border-amber-200 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, left = false, className = "" }) {
  return (
    <td
      className={`px-3 py-3 text-gray-800 ${
        left ? "text-left" : "text-center"
      } ${className}`}
    >
      {children}
    </td>
  );
}

function fmt(d) {
  if (!d) return "";
  try {
    const f = new Date(d);
    if (isNaN(f)) return d;
    return f.toLocaleDateString();
  } catch {
    return d;
  }
}
