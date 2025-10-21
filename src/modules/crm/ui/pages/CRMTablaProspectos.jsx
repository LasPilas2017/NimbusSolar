import React, { useEffect, useState } from "react";
import { ChevronDown, Search, Save, RotateCcw } from "lucide-react";
import FORMTablaProspectos from "./FORMTablaProspectos";

/**
 * CRMTablaProspectos
 * - Sin modificar tamaños/colores de tu tabla.
 * - Se quitaron los botones "Guardar" por fila y su columna.
 * - Si cambias Estatus o Venta, aparecen dos iconos arriba (Revertir y Guardar) dentro
 *   de la banda azul "Evaluación de Prospección".
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
  const [dirtyIds, setDirtyIds] = useState(new Set()); // filas con cambios pendientes

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
    setDirtyIds(new Set()); // limpiar pendientes al recargar
  }, [rows]);

  const eqMeta = (a, b) =>
    (a?.estatus ?? "") === (b?.estatus ?? "") &&
    (a?.venta ?? "") === (b?.venta ?? "");

  const baselineFor = (row) =>
    loadRowMeta(row.id) ?? {
      estatus: row.estatus ?? "Por Iniciar",
      venta: row.venta ? "Sí" : "No",
    };

  const markDirty = (id, nextMetaForRow, row) => {
    const base = baselineFor(row);
    setDirtyIds((prev) => {
      const s = new Set(prev);
      if (eqMeta(nextMetaForRow, base)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const handleBulkSave = () => {
    const ids = Array.from(dirtyIds);
    for (const id of ids) {
      const meta = rowMeta[id];
      if (meta) saveRowMeta(id, meta);
    }
    setDirtyIds(new Set());
  };

  const handleBulkRevert = () => {
    const ids = Array.from(dirtyIds);
    const next = { ...rowMeta };
    for (const id of ids) {
      const row = rows.find((x) => x.id === id);
      if (!row) continue;
      next[id] = baselineFor(row);
    }
    setRowMeta(next);
    setDirtyIds(new Set());
  };

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
        {/* Nota: NO se tocan tamaños de columnas/filas. */}
        <table className="w-full text-sm">
          <thead>
            {/* Banda de grupos */}
            <tr className="sticky top-0 z-20">
              <GroupBand colSpan={3} color="#1976D2" title="Información de Prospecto" />
              <GroupBand colSpan={2} color="#7341B2" title="Información de Prospección" />
              <GroupBand colSpan={1} color="#9B1B17" title="Contacto" />
              <GroupBand colSpan={1} color="#1565C0" title="Evaluación de Prospección" />
              <GroupBand colSpan={1} color="#1FA15D" title="Cierre" />
              {/* Última banda (antes cubría 6 columnas; quitamos "Guardar" => 5) */}
              <GroupBand
                colSpan={5}
                color="#1565C0"
                title="Evaluación de Prospección"
                rightSlot={
                  dirtyIds.size > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleBulkRevert}
                        className="h-7 w-7 rounded-md bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                        title="Revertir cambios"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkSave}
                        className="h-7 w-7 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center"
                        title="Guardar cambios"
                      >
                        <Save size={16} />
                      </button>
                    </div>
                  ) : null
                }
              />
            </tr>

            {/* Encabezados de columnas */}
            <tr className="sticky top-8 z-10 bg-[#EAF2FB] text-gray-900">
              <Th className="w-px text-center">ID</Th>
              <Th className="min-w-[180px]">Prospecto</Th>
              <Th className="w-px text-center">Condición</Th>

              <Th className="bg-[#EEE8F8] w-px text-center">Agente</Th>
              <Th className="bg-[#EEE8F8] w-px text-center">Canal</Th>

              <Th className="bg-[#FBE9EA] w-px text-center">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  Fecha 1 <ChevronDown size={14} />
                </div>
              </Th>

              <Th className="min-w-[280px]">Notas</Th>

              <Th className="bg-[#DFF5EA] w-px text-center">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  Fecha 5 <ChevronDown size={14} />
                </div>
              </Th>

              <Th className="w-px text-center">Días</Th>
              <Th className="w-px text-center">Avance</Th>
              <Th className="w-px text-center">Estatus</Th>
              <Th className="w-px text-center">Venta</Th>
              <Th className="w-px text-center">Total Ventas</Th>
              {/* Se eliminó el Th "Guardar" */}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0
              ? [...Array(10)].map((_, i) => (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                    {Array.from({ length: 13 }).map((__, j) => (
                      <td key={j} className="px-2 py-2 text-center text-red-500/70 whitespace-nowrap">
                        {j === 0 ? "0" : "—"}
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((r, i) => {
                  const meta = rowMeta[r.id] || { estatus: "Por Iniciar", venta: "No" };
                  const dias = diffDaysFrom(lastEffectiveContactDate(r));
                  const avance = avanceFromLastGestion(r);

                  const handleMetaChange = (patch) => {
                    setRowMeta((prev) => {
                      const next = {
                        ...prev,
                        [r.id]: { ...(prev[r.id] || {}), ...patch },
                      };
                      // Marcar sucio vs baseline
                      markDirty(r.id, next[r.id], r);
                      return next;
                    });
                  };

                  return (
                    <tr
                      key={r.id ?? i}
                      onClick={(e) => {
                        if (e.target?.closest?.("button,select")) return;
                        onRowClick?.(r);
                      }}
                      className={`transition ${i % 2 ? "bg-white" : "bg-[#FAFAFA]"} hover:bg-blue-50`}
                    >
                      {/* ID (compacto) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">{r.id}</Td>

                      {/* Prospecto (columna que puede crecer) */}
                      <Td left className="px-3">{r.prospecto}</Td>

                      {/* Condición (compacto) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">{r.condicion}</Td>

                      {/* Agente y Canal (compactos) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">{r.agente}</Td>
                      <Td className="w-px px-2 whitespace-nowrap text-center">{r.canal}</Td>

                      {/* Fecha 1 (compacta) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">{fmtFecha(r.fecha1)}</Td>

                      {/* Notas (flexible + botón lupa) */}
                      <Td left className="max-w-[420px]">
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

                      {/* Fecha 5 (compacta) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">{fmtFecha(r.fecha5)}</Td>

                      {/* Días y Avance (compactos) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">
                        {dias === "" ? "—" : dias}
                      </Td>
                      <Td className="w-px px-2 whitespace-nowrap text-center">
                        {avance ? `${avance}%` : "—"}
                      </Td>

                      {/* Estatus (compacto) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">
                        <select
                          value={meta.estatus}
                          onChange={(e) => handleMetaChange({ estatus: e.target.value })}
                          className="h-8 rounded-md border border-slate-300 px-2 bg-white text-[13px]"
                        >
                          <option>Por Iniciar</option>
                          <option>Proceso de Instalación</option>
                          <option>Finalizado</option>
                        </select>
                      </Td>

                      {/* Venta (compacto) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">
                        <select
                          value={meta.venta}
                          onChange={(e) => handleMetaChange({ venta: e.target.value })}
                          className="h-8 rounded-md border border-slate-300 px-2 bg-white text-[13px]"
                        >
                          <option>Sí</option>
                          <option>No</option>
                        </select>
                      </Td>

                      {/* Total Ventas (compacto, no rompe línea) */}
                      <Td className="w-px px-2 whitespace-nowrap text-center">
                        {fmtMoney(salesTotals[r.id] || 0)}
                      </Td>

                      {/* Se eliminó la celda de "Guardar" por fila */}
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
function GroupBand({ colSpan, color, title, rightSlot }) {
  return (
    <th
      colSpan={colSpan}
      className="relative text-white text-[13px] font-semibold whitespace-nowrap px-2 rounded-md"
      style={{ background: color, height: "32px" }}
    >
      {title}
      {rightSlot ? (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
      ) : null}
    </th>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-2 py-2 font-semibold text-[13px] text-left border-b border-amber-200 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, left = false, className = "" }) {
  return (
    <td
      className={`px-3 py-2 text-gray-800 ${left ? "text-left" : "text-center"} ${className}`}
    >
      {children}
    </td>
  );
}

/* ---------- Helpers ---------- */
function fmtFecha(d) {
  if (!d) return "—";
  try {
    const f = new Date(d);
    // Formato corto
    return isNaN(f)
      ? d
      : f.toLocaleDateString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
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
