import React, { useEffect, useMemo, useState } from "react";
import { X, ArrowUp, ArrowDown, Paperclip } from "lucide-react";

/**
 * FORMTablaProspectos (con gestión "Venta")
 * - Fecha/hora automáticas
 * - Si gestión === "Venta":
 *    * Deshabilita Canal y Tipo de comunicación
 *    * Muestra No. Factura, Monto Total y subida de archivo
 * - Historial: si es "Venta", en columna Seguimiento muestra No. Factura,
 *              y en columna Canal muestra Monto Total (+ icono de archivo si existe)
 */
export default function FORMTablaProspectos({ row, onClose, readStored, writeStored }) {
  const [ahoraTexto, setAhoraTexto] = useState(getAhoraTexto());
  const [gestion, setGestion] = useState("Contacto");
  const [seguimiento, setSeguimiento] = useState("");
  const [canal, setCanal] = useState("WhatsApp");
  const [tipo, setTipo] = useState("Entrante");
  const [comentario, setComentario] = useState("");

  // Campos exclusivos de VENTA
  const [noFactura, setNoFactura] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [archivo, setArchivo] = useState(null); // File | null
  const [archivoNombre, setArchivoNombre] = useState("");

  const supportsDate = useSupportsDateInput();
  const esVenta = gestion === "Venta";

  // Reloj en vivo
  useEffect(() => {
    const t = setInterval(() => setAhoraTexto(getAhoraTexto()), 1000);
    return () => clearInterval(t);
  }, []);

  // Historial combinado
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

  // Guardar registro en localStorage
  const handleSubmit = () => {
    if (!comentario.trim()) return;

    if (!esVenta) {
      // Validación normal
      if (!supportsDate && seguimiento && !/^\d{4}-\d{2}-\d{2}$/.test(seguimiento)) {
        alert("Formato de seguimiento inválido. Usa YYYY-MM-DD.");
        return;
      }
    } else {
      // Validaciones para venta
      if (!noFactura.trim()) {
        alert("Ingresa el No. de Factura.");
        return;
      }
      if (!montoTotal || Number.isNaN(+montoTotal) || +montoTotal <= 0) {
        alert("Ingresa un Monto Total válido mayor que 0.");
        return;
      }
    }

    // “Subir” archivo local (guardamos solo nombre/base64 para demo)
    let attachment = null;
    if (archivo) {
      attachment = { name: archivo.name, size: archivo.size, type: archivo.type };
    }

    const nuevo = {
      fecha: getHoyLocal(),
      hora: getHoraLocal(),
      gestion,
      // Si es venta, seguiremos guardando seguimiento (por consistencia) y además campos propios
      seguimiento: seguimiento || "",
      canal: esVenta ? "—" : canal,
      tipo: esVenta ? "—" : tipo,
      comentario: comentario.trim(),
      // Campos especiales de venta:
      venta: esVenta
        ? {
            factura: noFactura.trim(),
            monto: +montoTotal,
            archivo: attachment, // {name,size,type} o null
          }
        : null,
    };

    const prev = readStored?.(row?.id) ?? [];
    writeStored?.(row?.id, [nuevo, ...prev]);

    // Reset suave (conserva fecha/hora)
    setComentario("");
    if (esVenta) {
      setNoFactura("");
      setMontoTotal("");
      setArchivo(null);
      setArchivoNombre("");
    }
  };

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onFilePick = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setArchivo(f);
      setArchivoNombre(f.name);
    } else {
      setArchivo(null);
      setArchivoNombre("");
    }
  };

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
              <input
                value={ahoraTexto}
                readOnly
                disabled
                className="h-10 rounded-lg border border-slate-300 px-3 bg-slate-50 text-slate-700"
              />

              {/* Gestión / Seguimiento / (Venta: factura, monto, archivo) */}
              <div className="flex gap-2 mt-3">
                <div className="flex flex-col flex-1">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Tipo de gestión</label>
                  <select
                    value={gestion}
                    onChange={(e) => setGestion(e.target.value)}
                    className="h-10 rounded-lg border border-slate-300 px-3"
                  >
                    <option>Contacto</option>
                    <option>Seguimiento</option>
                    <option>Cotización</option>
                    <option>Cita</option>
                    <option>Visita Tecnica</option>
                    <option>Cierre</option>
                    <option>No contesta</option>
                    <option>Proceso de Instalación</option>
                    <option>Venta</option>
                  </select>
                </div>

                {/* Seguimiento (siempre visible) */}
                <div className="flex flex-col flex-1">
                  <label className="text-[13px] font-medium text-slate-700 mb-1">Seguimiento</label>
                  {supportsDate ? (
                    <input
                      type="date"
                      value={seguimiento}
                      onChange={(e) => setSeguimiento(e.target.value)}
                      className="h-10 rounded-lg border border-slate-300 px-3"
                    />
                  ) : (
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="YYYY-MM-DD"
                      value={seguimiento}
                      onChange={(e) => setSeguimiento(e.target.value)}
                      className="h-10 rounded-lg border border-slate-300 px-3"
                    />
                  )}
                </div>
              </div>

              {/* Bloque adicional cuando es Venta */}
              {esVenta && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                  <div className="flex flex-col">
                    <label className="text-[13px] font-medium text-slate-700 mb-1">No. Factura</label>
                    <input
                      value={noFactura}
                      onChange={(e) => setNoFactura(e.target.value)}
                      className="h-10 rounded-lg border border-slate-300 px-3"
                      placeholder="F001-000123"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[13px] font-medium text-slate-700 mb-1">Monto Total</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={montoTotal}
                      onChange={(e) => setMontoTotal(e.target.value)}
                      className="h-10 rounded-lg border border-slate-300 px-3"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[13px] font-medium text-slate-700 mb-1">Documento</label>
                    <label className="h-10 rounded-lg border border-slate-300 px-3 flex items-center gap-2 cursor-pointer hover:bg-slate-50">
                      <Paperclip size={16} />
                      <span className="truncate text-sm">{archivoNombre || "Subir PDF/Imagen"}</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={onFilePick}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Columna 2: Canal (bloqueado si es Venta) */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">Canal</label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 disabled:bg-slate-100 disabled:text-slate-500"
                disabled={esVenta}
              >
                <option>WhatsApp</option>
                <option>Llamada</option>
                <option>Correo</option>
                <option>Presencial</option>
              </select>
            </div>

            {/* Columna 3: Tipo de comunicación (bloqueado si es Venta) */}
            <div className="flex flex-col">
              <label className="text-[13px] font-medium text-slate-700 mb-1">Tipo de comunicación</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 px-3 disabled:bg-slate-100 disabled:text-slate-500"
                disabled={esVenta}
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
              className="rounded-lg border border-slate-300 px-3 py-2"
              placeholder={esVenta ? "Notas de la venta..." : "Ej. Cliente solicita comparar inversores..."}
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <button className="h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50" onClick={onClose}>
              Cerrar
            </button>
            <button className="h-10 px-4 rounded-lg bg-[#183659] text-white hover:brightness-110" onClick={handleSubmit}>
              Agregar Registro
            </button>
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
                    <th className="px-3 py-2 text-left">Seguimiento / No. Factura</th>
                    <th className="px-3 py-2 text-left">Canal / Monto</th>
                    <th className="px-3 py-2 text-left">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-slate-500">
                        Sin registros todavía.
                      </td>
                    </tr>
                  ) : (
                    historial.map((h, i) => {
                      const esVentaRow = !!h.venta;
                      return (
                        <tr key={i} className={i % 2 ? "bg-white" : "bg-[#FAFAFA]"}>
                          <td className="px-3 py-2">{h.fecha}</td>
                          <td className="px-3 py-2">{h.hora || ""}</td>
                          <td className="px-3 py-2">{h.gestion}</td>

                          {/* Seguimiento / No. Factura */}
                          <td className="px-3 py-2">
                            {esVentaRow ? h.venta?.factura || "—" : h.seguimiento || "—"}
                          </td>

                          {/* Canal / Monto + archivo */}
                          <td className="px-3 py-2">
                            {esVentaRow ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{fmtMoney(h.venta?.monto || 0)}</span>
                                {h.venta?.archivo?.name && (
                                  <span className="inline-flex items-center gap-1 text-slate-600">
                                    <Paperclip size={14} />
                                    <span className="truncate max-w-[160px]">{h.venta.archivo.name}</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <>
                                <CanalBadge canal={h.canal} />{" "}
                                {h.tipo === "Entrante" ? (
                                  <ArrowDown className="inline -mt-1" size={14} />
                                ) : (
                                  <ArrowUp className="inline -mt-1" size={14} />
                                )}
                              </>
                            )}
                          </td>

                          <td className="px-3 py-2">{h.comentario}</td>
                        </tr>
                      );
                    })
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

/* ---------- Helpers locales del formulario ---------- */

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
