import React, { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import FORMTablaProspectos from "./FORMTablaProspectos";

/**
 * CRMTablaProspectos
 * - Días: calculados desde último contacto efectivo (excepto "No contesta")
 * - Avance: basado en la última gestión (25/50/75/100)
 * - Estatus y Venta editables (select)
 * - Total Ventas simulado (por ahora)
 * - Modal FORMTablaProspectos importado
 */

export default function CRMTablaProspectos({
  rows = [],
  onRowClick,
  storageKey = "crm_historial_contactos",
}) {
  const [rowActivo, setRowActivo] = useState(null);

  // Totales de ventas simulados (hasta conectar base de datos)
  const [salesTotals] = useState(() => {
    const totals = {};
    for (const r of rows) totals[r.id] = Math.floor(Math.random() * 50000) + 1000;
    return totals;
  });

  /** ---------- Historial (lectura y escritura en localStorage) ---------- */
  const readStored = (id) => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`${storageKey}:${id}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeStored = (id, data) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${storageKey}:${id}`, JSON.stringify(data));
    } catch {}
  };

  /** ---------- Estatus y Venta ---------- */
  const metaKey = (id) => `crm_row_meta:${id}`;
  const loadRowMeta = (id) => {
    try {
      const raw = localStorage.getItem(metaKey(id));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const saveRowMeta = (id, meta) => {
    try {
      localStorage.setItem(metaKey(id), JSON.stringify(meta));
    } catch {}
  };

  const [rowMeta, setRowMeta] = useState({});

  useEffect(() => {
    const next = {};
    for (const r of rows) {
      const saved = loadRowMeta(r.id);
      next[r.id] = {
        estatus: saved?.estatus ?? r.estatus ?? "Por Iniciar",
        venta: saved?.venta ?? (r.venta ? "Sí" : "No"),
      };
    }
    setRowMeta(next);
  }, [rows]);

  /** ---------- Cálculos de días y avance ---------- */
  const mergeHistorial = (row) => {
    const loc = readStored(row.id) ?? [];
    const base = Array.isArray(row.historialContactos) ? row.historialContactos : [];
    const all = [...base, ...loc];
    return all.sort((a, b) => {
      const ta = `${a.fecha || ""} ${a.hora || ""}`;
      const tb = `${b.fecha || ""} ${b.hora || ""}`;
      return ta < tb ? 1 : ta > tb ? -1 : 0;
    });
  };

  const lastEffectiveContactDate = (row) => {
    const hist = mergeHistorial(row);
    const eff = hist.find((h) => (h.gestion || "").toLowerCase() !== "no contesta" && h.fecha);
    return eff?.fecha || row.fecha1 || null;
  };

  const diffDaysFrom = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return "";
    const a = new Date(yyyy_mm_dd);
    if (isNaN(a)) return "";
    const today = new Date();
    a.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const ms = today - a;
    return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  };

  const avanceFromLastGestion = (row) => {
    const hist = mergeHistorial(row);
    const g = (hist[0]?.gestion || "").toLowerCase();
    if (g.includes("cierre")) return 100;
    if (g.includes("visita")) return 75;
    if (g.includes("cotiz")) return 50;
    if (g.includes("contacto") || g.includes("seguim")) return 25;
    return 0;
  };

  /** ---------- Render principal ---------- */
  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-3">
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full text-sm">
          <thead>
            <tr className="sticky top-0 h-8">
              <GroupBand colSpan={3} color="#1976D2" title="Información de Prospecto" />
              <GroupBand colSpan={2} color="#7341B2" title="Información de Prospección" />
              <GroupBand colSpan={1} color="#9B1B17" title="Contacto" />
              <GroupBand colSpan={1} color="#1565C0" title="Evaluación de Prospección" />
              <GroupBand colSpan={1} color="#1FA15D" title="Cierre" />
              <GroupBand colSpan={6} color="#1565C0" title="Evaluación de Prospección" />
            </tr>

            <tr className="sticky top-8 z-10 bg-[#EAF2FB] text-gray-900">
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
              <Th>Notas</Th>
              <Th className="bg-[#DFF5EA]">
                <div className="flex items-center gap-1">
                  Fecha 5 <ChevronDown size={14} />
                </div>
              </Th>
              <Th>Días</Th>
              <Th>Avance</Th>
              <Th>Estatus</Th>
              <Th>Venta</Th>
              <Th>Total Ventas</Th>
              <Th>Guardar</Th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0
              ? [...Array(10)].map((_, i) => (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                    {Array.from({ length: 13 }).map((__, j) => (
                      <td key={j} className="px-3 py-3 text-center text-red-500/70">
                        {j === 0 ? "0" : ""}
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((r, i) => {
                  const meta = rowMeta[r.id] || { estatus: "Por Iniciar", venta: "No" };
                  const dias = diffDaysFrom(lastEffectiveContactDate(r));
                  const avance = avanceFromLastGestion(r);

                  const handleMetaChange = (patch) => {
                    setRowMeta((prev) => ({
                      ...prev,
                      [r.id]: { ...(prev[r.id] || {}), ...patch },
                    }));
                  };

                  const handleSave = () => {
                    const toSave = rowMeta[r.id] || {};
                    saveRowMeta(r.id, toSave);
                  };

                  return (
                    <tr
                      key={r.id ?? i}
                      onClick={(e) => {
                        if ((e.target)?.closest?.("button,select")) return;
                        onRowClick?.(r);
                      }}
                      className={`transition ${i % 2 ? "bg-white" : "bg-[#FAFAFA]"} hover:bg-blue-50`}
                    >
                      <Td>{r.id}</Td>
                      <Td left>{r.prospecto}</Td>
                      <Td>{r.condicion}</Td>
                      <Td>{r.agente}</Td>
                      <Td>{r.canal}</Td>
                      <Td>{fmtFecha(r.fecha1)}</Td>

                      {/* Notas + lupa */}
                      <Td left className="max-w-[380px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate" title={r.notas || ""}>
                            {r.notas || "—"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRowActivo(r)}
                            className="ml-auto inline-flex items-center justify-center rounded-full border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition h-7 w-7"
                            title="Ver/Agregar contactos"
                          >
                            <Search size={16} />
                          </button>
                        </div>
                      </Td>

                      <Td>{fmtFecha(r.fecha5)}</Td>
                      <Td>{dias === "" ? "—" : dias}</Td>
                      <Td>{avance ? `${avance}%` : "—"}</Td>

                      {/* Estatus */}
                      <Td>
                        <select
                          value={meta.estatus}
                          onChange={(e) => handleMetaChange({ estatus: e.target.value })}
                          className="h-9 rounded-md border border-slate-300 px-2 bg-white"
                        >
                          <option>Por Iniciar</option>
                          <option>Proceso de Instalación</option>
                          <option>Finalizado</option>
                        </select>
                      </Td>

                      {/* Venta */}
                      <Td>
                        <select
                          value={meta.venta}
                          onChange={(e) => handleMetaChange({ venta: e.target.value })}
                          className="h-9 rounded-md border border-slate-300 px-2 bg-white"
                        >
                          <option>Sí</option>
                          <option>No</option>
                        </select>
                      </Td>

                      {/* Total Ventas */}
                      <Td>{fmtMoney(salesTotals[r.id] || 0)}</Td>

                      {/* Guardar */}
                      <Td>
                        <button
                          type="button"
                          onClick={handleSave}
                          className="h-9 px-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                          title="Guardar estatus y venta"
                        >
                          Guardar
                        </button>
                      </Td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {rowActivo && (
        <FORMTablaProspectos
          row={rowActivo}
          readStored={readStored}
          writeStored={writeStored}
          onClose={() => setRowActivo(null)}
        />
      )}
    </div>
  );
}

/* ---------- Subcomponentes ---------- */
function GroupBand({ colSpan, color, title }) {
  return (
    <th
      colSpan={colSpan}
      className="text-white text-[13px] font-semibold whitespace-nowrap px-3 rounded-md"
      style={{ background: color, height: "32px" }}
    >
      {title}
    </th>
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
      className={`px-3 py-3 text-gray-800 ${left ? "text-left" : "text-center"} ${className}`}
    >
      {children}
    </td>
  );
}

/* ---------- Helpers ---------- */
function fmtFecha(d) {
  if (!d) return "";
  try {
    const f = new Date(d);
    return isNaN(f) ? d : f.toLocaleDateString();
  } catch {
    return d;
  }
}

function fmtMoney(n = 0) {
  try {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n || 0);
  } catch {
    return `Q ${Number(n || 0).toFixed(2)}`;
  }
}
