import React from "react";
import { ChevronDown } from "lucide-react";

/**
 * Tabla de Prospección con “bandas” de color alineadas a columnas
 * - Las bandas ahora viven en la PRIMERA fila del THEAD con colSpan exacto
 * - Ambas filas del header son sticky: bandas (top-0) y títulos (top-8)
 * - Scroll horizontal preservado, zebra y hover
 */
export default function CRMTablaProspectos({ rows = [], onRowClick }) {
  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-3">
      <div className="overflow-x-auto">
        {/* min-w para evitar quiebres; ajusta si necesitas más ancho */}
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="z-20">
            {/* ===== Fila 1: Bandas de color (alineadas por colSpan) ===== */}
            <tr className="sticky top-0 h-8">
              {/* Información de Prospecto: ID, Prospecto, Condición (3 cols) */}
              <GroupBand colSpan={3} color="#1976D2" title="Información de Prospecto" />
              {/* Información de Prospección: Agente, Canal (2 cols) */}
              <GroupBand colSpan={2} color="#7341B2" title="Información de Prospección" />
              {/* Contacto (Fecha 1) */}
              <GroupBand colSpan={1} color="#9B1B17" title="Contacto" />
              {/* Cita (Fecha 2) */}
              <GroupBand colSpan={1} color="#D97706" title="Cita" />
              {/* Candidato (Fecha 3) */}
              <GroupBand colSpan={1} color="#EAB308" title="Candidato" />
              {/* Cotización (Fecha 4) */}
              <GroupBand colSpan={1} color="#4CAF50" title="Cotización" />
              {/* Cierre (Fecha 5) */}
              <GroupBand colSpan={1} color="#1FA15D" title="Cierre" />
              {/* Evaluación de Prospección: Días, Avance, Estatus, Venta, Notas (5 cols) */}
              <GroupBand colSpan={5} color="#1565C0" title="Evaluación de Prospección" />
            </tr>

            {/* ===== Fila 2: Títulos de columna ===== */}
            {/* La segunda fila es sticky debajo de la primera: top-8 (misma altura de arriba) */}
            <tr className="sticky top-8 z-10 bg-[#EAF2FB] text-gray-900">
              <Th>ID</Th>
              <Th>Prospecto</Th>
              <Th>Condición</Th>

              {/* Prospección */}
              <Th className="bg-[#EEE8F8]">Agente</Th>
              <Th className="bg-[#EEE8F8]">Canal</Th>

              {/* Fechas (cada una con su color suave) */}
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

              {/* Evaluación */}
              <Th>Días</Th>
              <Th>Avance</Th>
              <Th>Estatus</Th>
              <Th>Venta</Th>
              <Th>Notas</Th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0
              ? [...Array(10)].map((_, i) => (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                    {Array.from({ length: 16 }).map((__, j) => (
                      <td key={j} className="px-3 py-3 text-center text-red-500/70">
                        {j === 0 ? "0" : ""}
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    onClick={() => onRowClick?.(r)}
                    className={`transition ${i % 2 ? "bg-white" : "bg-[#FAFAFA]"} hover:bg-blue-50 cursor-pointer`}
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
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

/**
 * Celda de “banda” superior (título de grupo)
 * - colSpan define el ancho exacto (cuántas columnas cubre)
 * - sticky junto con la fila para que siempre quede arriba
 */
function GroupBand({ colSpan, color, title }) {
  return (
    <th
      colSpan={colSpan}
      className="text-white text-[13px] font-semibold whitespace-nowrap px-3 rounded-md"
      style={{
        background: color,
        // altura fija para calcular top-8 de la fila de títulos
        height: "32px",
      }}
    >
      {title}
    </th>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-2 font-semibold text-[13px] text-left border-b border-amber-200 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, left = false, className = "" }) {
  return (
    <td
      className={`px-3 py-3 text-gray-800 ${left ? "text-left" : "text-center"} ${className}`}
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
