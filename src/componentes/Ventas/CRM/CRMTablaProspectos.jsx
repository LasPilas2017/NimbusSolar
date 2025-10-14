import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X, ArrowUp, ArrowDown } from "lucide-react";

/**
 * CRMTablaProspectos (completo)
 * - DÍAS: desde último contacto efectivo (gestión != "No contesta"); fallback: fecha1
 * - AVANCE: según última gestión (25/50/75/100)
 * - ESTATUS y VENTA editables (select) + GUARDAR con persistencia en localStorage (por ID)
 * - Modal de Notas con historial (persistencia local)
 */

export default function CRMTablaProspectos({
  rows = [],
  onRowClick,
  storageKey = "crm_historial_contactos",
}) {
  const [rowActivo, setRowActivo] = useState(null);

  // Totales simulados de ventas (temporal hasta conexión a base de datos)
const [salesTotals, setSalesTotals] = useState(() => {
  const totals = {};
  for (const r of rows) {
    // valor simulado, puedes cambiarlo por datos reales o cálculos
    totals[r.id] = Math.floor(Math.random() * 50000) + 1000;
  }
  return totals;
});

  /** ---------- Historial (persistencia existente) ---------- */
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

  /** ---------- Meta por fila (estatus/venta) ---------- */
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

  // Estado único para todos los rows (evita hooks dentro del map)
  const [rowMeta, setRowMeta] = useState({}); // { [id]: { estatus, venta } }

  // Inicializa rowMeta con lo guardado o valores del row
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

  /** ---------- Cálculos DÍAS / AVANCE ---------- */
  const mergeHistorial = (row) => {
    const loc = readStored(row.id) ?? [];
    const base = Array.isArray(row.historialContactos) ? row.historialContactos : [];
    const all = [...base, ...loc];
    // Ordena DESC por fecha+hora
    return all.sort((a, b) => {
      const ta = `${a.fecha || ""} ${a.hora || ""}`;
      const tb = `${b.fecha || ""} ${b.hora || ""}`;
      return ta < tb ? 1 : ta > tb ? -1 : 0;
    });
  };


  const lastEffectiveContactDate = (row) => {
    const hist = mergeHistorial(row);
    const eff = hist.find(
      (h) => (h.gestion || "").toLowerCase() !== "no contesta" && h.fecha
    );
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
    // Nota: puedes ajustar aquí si agregas nuevas gestiones
  };

  /** ---------- Render ---------- */
  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-3">
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full text-sm">
          <thead className="z-20">
            {/* Bandas superiores (colSpan ajustado a nuevas columnas) */}
            <tr className="sticky top-0 h-8">
              <GroupBand colSpan={3} color="#1976D2" title="Información de Prospecto" />
              <GroupBand colSpan={2} color="#7341B2" title="Información de Prospección" />
              <GroupBand colSpan={1} color="#9B1B17" title="Contacto" />
              <GroupBand colSpan={1} color="#1565C0" title="Evaluación de Prospección" />
              <GroupBand colSpan={1} color="#1FA15D" title="Cierre" />
              <GroupBand colSpan={6} color="#1565C0" title="Evaluación de Prospección" />
            </tr>

            {/* Encabezados */}
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
                      className={`transition ${
                        i % 2 ? "bg-white" : "bg-[#FAFAFA]"
                      } hover:bg-blue-50`}
                    >
                      <Td>{r.id}</Td>
                      <Td left>{r.prospecto}</Td>
                      <Td>{r.condicion}</Td>
                      <Td>{r.agente}</Td>
                      <Td>{r.canal}</Td>
                      <Td>{fmtFecha(r.fecha1)}</Td>

                      {/* Notas + Lupa */}
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

                      {/* DÍAS */}
                      <Td>{dias === "" ? "—" : dias}</Td>

                      {/* AVANCE */}
                      <Td>{avance ? `${avance}%` : "—"}</Td>

                      {/* ESTATUS */}
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

                      {/* VENTA */}
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

{/* TOTAL VENTAS */}
<Td>{fmtMoney(salesTotals[r.id] || 0)}</Td>

{/* GUARDAR */}
<Td>
  <button
    type="button"
    onClick={handleSave}
    className="h-9 px-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
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

      {/* Modal Notas/Historial */}
      {rowActivo && (
        <ModalRegistroContactos
          row={rowActivo}
          readStored={readStored}
          writeStored={writeStored}
          onClose={() => setRowActivo(null)}
        />
      )}
    </div>
  );
}

/* ---------- Subcomponentes visuales ---------- */

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
    <th className={`px-3 py-2 font-semibold text-[13px] text-left border-b border-amber-200 ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, left = false, className = "" }) {
  return (
    <td className={`px-3 py-3 text-gray-800 ${left ? "text-left" : "text-center"} ${className}`}>
      {children}
    </td>
  );
}
function fmtFecha(d) {
  if (!d) return "";
  try {
    const f = new Date(d);
    return isNaN(f) ? d : f.toLocaleDateString();
  } catch {
    return d;
  }
}
// ---- Formato de moneda ----
function fmtMoney(n = 0) {
  try {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ", // Cambia a "USD" o "PEN" si prefieres otra moneda
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n || 0);
  } catch {
    return `Q ${Number(n || 0).toFixed(2)}`;
  }
}

/* =================== Helpers de tiempo =================== */
function getHoyLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function getHoraLocal() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function getAhoraTexto() {
  return `${getHoyLocal()} ${getHoraLocal()}`;
}

/* ---------- Soporte <input type="date"> ---------- */
function useSupportsDateInput() {
  const [supports, setSupports] = useState(true);
  useEffect(() => {
    try {
      const input = document.createElement("input");
      input.setAttribute("type", "date");
      setSupports(input.type === "date");
    } catch {
      setSupports(false);
    }
  }, []);
  return supports;
}

/* =================== Modal Registro & Historial =================== */

function ModalRegistroContactos({ row, onClose, readStored, writeStored }) {
  const [ahoraTexto, setAhoraTexto] = useState(getAhoraTexto());
  const [gestion, setGestion] = useState("Contacto");
  const [seguimiento, setSeguimiento] = useState("");
  const [canal, setCanal] = useState("WhatsApp");
  const [tipo, setTipo] = useState("Entrante");
  const [comentario, setComentario] = useState("");

  const supportsDate = useSupportsDateInput();

  // reloj en vivo
  useEffect(() => {
    const t = setInterval(() => setAhoraTexto(getAhoraTexto()), 1000);
    return () => clearInterval(t);
  }, []);

  // historial combinado
  const historial = useMemo(() => {
    const almacenado = readStored?.(row?.id) ?? [];
    const base = Array.isArray(row?.historialContactos) ? row.historialContactos : [];
    const all = [...base, ...almacenado];
    return all.sort((a, b) => {
      const ta = `${a.fecha || ""} ${a.hora || ""}`;
      const tb = `${b.fecha || ""} ${b.hora || ""}`;
      return ta < tb ? 1 : ta > tb ? -1 : 0;
    });
  }, [row, readStored]);

  const handleSubmit = () => {
    if (!comentario.trim()) return;
    if (!supportsDate && seguimiento && !/^\d{4}-\d{2}-\d{2}$/.test(seguimiento)) {
      alert("Formato de seguimiento inválido. Usa YYYY-MM-DD.");
      return;
    }
    const nuevo = {
      fecha: getHoyLocal(),
      hora: getHoraLocal(),
      gestion,
      seguimiento: seguimiento || "",
      canal,
      tipo,
      comentario: comentario.trim(),
    };
    const prev = readStored?.(row?.id) ?? [];
    writeStored?.(row?.id, [nuevo, ...prev]);
    setComentario("");
  };

  // cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      {/* Dialog */}
      <div className="relative z-[101] w-[880px] max-w-[95vw] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#183659] text-white px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            Registro de contactos — {row?.prospecto?.toUpperCase?.() || `#${row?.id}`}
          </h3>
          <button className="rounded-full hover:bg-white/10 p-1" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Columna 1: Fecha/hora auto + Gestión/Seguimiento */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">Fecha y hora (auto)</label>
              <input value={ahoraTexto} readOnly disabled className="h-10 rounded-lg border border-slate-300 px-3 bg-slate-50 text-slate-700" />
              <div className="flex gap-2 mt-3">
                <div className="flex flex-col flex-1">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Tipo de gestión</label>
                  <select value={gestion} onChange={(e) => setGestion(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-3">
                    <option>Contacto</option>
                    <option>No contesta</option>
                    <option>Seguimiento</option>
                    <option>Cotización</option>
                    <option>Cita</option>
                    <option>Visita Tecnica</option>
                    <option>Cierre</option>
                    <option>Proceso de Instalación</option>
                  </select>
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Seguimiento</label>
                  {supportsDate ? (
                    <input type="date" value={seguimiento} onChange={(e) => setSeguimiento(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-3" />
                  ) : (
                    <input type="text" inputMode="numeric" placeholder="YYYY-MM-DD" value={seguimiento} onChange={(e) => setSeguimiento(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-3" />
                  )}
                </div>
              </div>
            </div>

            {/* Columna 2: Canal */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">Canal</label>
              <select value={canal} onChange={(e) => setCanal(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-3">
                <option>WhatsApp</option>
                <option>Llamada</option>
                <option>Correo</option>
                <option>Presencial</option>
              </select>
            </div>

            {/* Columna 3: Tipo de comunicación */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">Tipo de comunicación</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-3">
                <option>Entrante</option>
                <option>Saliente</option>
              </select>
            </div>
          </div>

          {/* Comentario */}
          <div className="flex flex-col">
            <label className="text-[13px] font-medium text-slate-700 mb-1">Comentario</label>
            <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. Cliente solicita comparar inversores..." />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <button className="h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50" onClick={onClose}>Cerrar</button>
            <button className="h-10 px-4 rounded-lg bg-[#183659] text-white hover:brightness-110" onClick={handleSubmit}>Agregar contacto</button>
          </div>
        </div>

        {/* Historial */}
        <div className="px-4 pb-5">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-[#183659] text-white px-4 py-2 font-semibold">Historial</div>
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Hora</th>
                    <th className="px-3 py-2 text-left">Gestión</th>
                    <th className="px-3 py-2 text-left">Seguimiento</th>
                    <th className="px-3 py-2 text-left">Canal</th>
                    <th className="px-3 py-2 text-left">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-slate-500">Sin registros todavía.</td>
                    </tr>
                  ) : (
                    historial.map((h, i) => (
                      <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                        <td className="px-3 py-2">{h.fecha}</td>
                        <td className="px-3 py-2">{h.hora || ""}</td>
                        <td className="px-3 py-2">{h.gestion}</td>
                        <td className="px-3 py-2">{h.seguimiento || "—"}</td>
                        <td className="px-3 py-2">
                          <CanalBadge canal={h.canal} />{" "}
                          {h.tipo === "Entrante" ? (
                            <ArrowDown className="inline -mt-1" size={14} />
                          ) : (
                            <ArrowUp className="inline -mt-1" size={14} />
                          )}
                        </td>
                        <td className="px-3 py-2">{h.comentario}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers visuales ---------- */
function CanalBadge({ canal = "Otro" }) {
  const color =
    canal === "WhatsApp"
      ? "bg-blue-100 text-blue-700"
      : canal === "Llamada"
      ? "bg-amber-100 text-amber-700"
      : canal === "Correo"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-slate-100 text-slate-700";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{canal}</span>;
}
