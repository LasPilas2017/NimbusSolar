import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X, ArrowUp, ArrowDown } from "lucide-react";

/**
 * CRMTablaProspectos
 * - Bandas de color por colSpan (sticky)
 * - Cita/Candidato/Cotización -> columna única "Notas" con lupa
 * - Modal con Formulario + Historial
 * - Fecha y Hora automáticas (no editables) en un solo campo
 * - Persistencia localStorage por ID de prospecto
 */
export default function CRMTablaProspectos({
  rows = [],
  onRowClick,
  storageKey = "crm_historial_contactos",
}) {
  const [rowActivo, setRowActivo] = useState(null);

  // Helpers de almacenamiento
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

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-3">
      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="z-20">
            {/* ===== Fila 1: Bandas de color ===== */}
            <tr className="sticky top-0 h-8">
              <GroupBand colSpan={3} color="#1976D2" title="Información de Prospecto" />
              <GroupBand colSpan={2} color="#7341B2" title="Información de Prospección" />
              <GroupBand colSpan={1} color="#9B1B17" title="Contacto" />
              <GroupBand colSpan={1} color="#1565C0" title="Evaluación de Prospección" />
              <GroupBand colSpan={1} color="#1FA15D" title="Cierre" />
              <GroupBand colSpan={4} color="#1565C0" title="Evaluación de Prospección" />
            </tr>

            {/* ===== Fila 2: Títulos ===== */}
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
            </tr>
          </thead>

          <tbody>
            {rows.length === 0
              ? [...Array(10)].map((_, i) => (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                    {Array.from({ length: 12 }).map((__, j) => (
                      <td key={j} className="px-3 py-3 text-center text-red-500/70">
                        {j === 0 ? "0" : ""}
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    onClick={(e) => {
                      if ((e.target)?.closest?.("button")) return;
                      onRowClick?.(r);
                    }}
                    className={`transition ${i % 2 ? "bg-white" : "bg-[#FAFAFA]"} hover:bg-blue-50 cursor-pointer`}
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

                    <Td>{r.dias}</Td>
                    <Td>{r.avance}</Td>
                    <Td>{r.estatus}</Td>
                    <Td>{r.venta ? "Sí" : "No"}</Td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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

function fmtFecha(d) {
  if (!d) return "";
  try {
    const f = new Date(d);
    if (isNaN(f)) return d;
    return f.toLocaleDateString();
  } catch {
    return d;
  }
}

/* =================== Helpers de tiempo =================== */

// 'YYYY-MM-DD' en hora local
function getHoyLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// 'HH:MM' en hora local
function getHoraLocal() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Texto "YYYY-MM-DD HH:MM" (para mostrar en el input combinado)
function getAhoraTexto() {
  return `${getHoyLocal()} ${getHoraLocal()}`;
}

/* =================== Modal Registro & Historial =================== */

function ModalRegistroContactos({ row, onClose, readStored, writeStored }) {
  // Estado de reloj en vivo (solo para mostrar, no editable)
  const [ahoraTexto, setAhoraTexto] = useState(getAhoraTexto());
  const [gestion, setGestion] = useState("Contacto");
  const [canal, setCanal] = useState("WhatsApp");
  const [tipo, setTipo] = useState("Entrante");
  const [comentario, setComentario] = useState("");

  // Tick del reloj (actualiza cada 1s)
  useEffect(() => {
    const t = setInterval(() => setAhoraTexto(getAhoraTexto()), 1000);
    return () => clearInterval(t);
  }, []);

  // Historial combinado: backend + localStorage
  const historial = useMemo(() => {
    const almacenado = readStored?.(row?.id) ?? [];
    const base = Array.isArray(row?.historialContactos) ? row.historialContactos : [];
    const seen = new Set();
    const all = [...base, ...almacenado].filter((h) => {
      const key = `${h.fecha}__${h.hora || ""}__${h.comentario}__${h.gestion || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Orden descendente por fecha + hora (si existen)
    return all.sort((a, b) => {
      const ta = `${a.fecha || ""} ${a.hora || ""}`;
      const tb = `${b.fecha || ""} ${b.hora || ""}`;
      return ta < tb ? 1 : ta > tb ? -1 : 0;
    });
  }, [row, readStored]);

  // Guardar (localStorage)
  const handleSubmit = () => {
    if (!comentario.trim()) return;
    const nuevo = {
      fecha: getHoyLocal(),     // <-- auto
      hora: getHoraLocal(),     // <-- auto
      gestion,                  // <-- select
      canal,                    // <-- select
      tipo,                     // <-- select
      comentario: comentario.trim(),
    };
    const prev = readStored?.(row?.id) ?? [];
    const next = [nuevo, ...prev];
    writeStored?.(row?.id, next);
    setComentario("");
  };

  // Esc para cerrar
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div className="relative z-[101] w-[880px] max-w-[95vw] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#183659] text-white px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            Registro de contactos — {row?.prospecto?.toUpperCase?.() || `#${row?.id}`}
          </h3>
          <button
            className="rounded-full hover:bg-white/10 p-1"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Columna 1: Fecha y hora automáticas (no editable) + Gestión */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">
                Fecha y hora (auto)
              </label>
              <input
                value={ahoraTexto}
                readOnly
                disabled
                className="h-10 rounded-lg border border-slate-300 px-3 bg-slate-50 text-slate-700"
              />
              <label className="text-[13px] font-medium text-slate-700 mt-3 mb-1">
                Tipo de gestión
              </label>
              <select
                value={gestion}
                onChange={(e) => setGestion(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option>Contacto</option>
                <option>No contesta</option>
                <option>Cotización</option>
                <option>Cita</option>
                <option>Visita Tecnica</option>
                <option>Cierre</option>
                <option>Proceso de Instalación</option>
              </select>
            </div>

            {/* Columna 2: Canal */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">Canal</label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option>WhatsApp</option>
                <option>Llamada</option>
                <option>Correo</option>
                <option>Presencial</option>
              </select>
            </div>

            {/* Columna 3: Tipo de comunicación */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">
                Tipo de comunicación
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option>Entrante</option>
                <option>Saliente</option>
              </select>
            </div>
          </div>

          {/* Comentario */}
          <div className="flex flex-col">
            <label className="text-[13px] font-medium text-slate-700 mb-1">Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Ej. Cliente solicita comparar inversores de 5kW y 8kW..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <button
              className="h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              className="h-10 px-4 rounded-lg bg-[#183659] text-white hover:brightness-110"
              onClick={handleSubmit}
            >
              Agregar contacto
            </button>
          </div>
        </div>

        {/* Historial */}
        <div className="px-4 pb-5">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-[#183659] text-white px-4 py-2 font-semibold">
              Historial
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="text-left px-3 py-2">Fecha</th>
                    <th className="text-left px-3 py-2">Hora</th>
                    <th className="text-left px-3 py-2">Gestión</th>
                    <th className="text-left px-3 py-2">Canal</th>
                    <th className="text-left px-3 py-2">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                        Sin registros todavía.
                      </td>
                    </tr>
                  ) : (
                    historial.map((h, idx) => (
                      <tr key={idx} className={idx % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                        <td className="px-3 py-2">{h.fecha}</td>
                        <td className="px-3 py-2">{h.hora || ""}</td>
                        <td className="px-3 py-2">
                          <GestionBadge gestion={h.gestion || "Contacto"} />
                        </td>
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
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {canal}
    </span>
  );
}

function GestionBadge({ gestion = "Contacto" }) {
  const map = {
    "Contacto": "bg-emerald-100 text-emerald-700",
    "Cita": "bg-orange-100 text-orange-700",
    "Candidato": "bg-yellow-100 text-yellow-700",
    "Cotización": "bg-green-100 text-green-700",
    "Cierre": "bg-teal-100 text-teal-700",
    "No contesta": "bg-rose-100 text-rose-700",
    "Visita Tecnica": "bg-indigo-100 text-indigo-700",
    "Proceso de Instalación": "bg-cyan-100 text-cyan-700",
  };
  const cls = map[gestion] || "bg-slate-100 text-slate-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {gestion}
    </span>
  );
}
