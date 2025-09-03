import React from "react";

export default function EncabezadoProyecto({
  proyecto = {},            // { tipo?: string, nombre?: string }
  fechas = [],              // [{inicio: "YYYY-MM-DD", fin: "YYYY-MM-DD"}, ...]
  quincenas = [],           // ["1ra. Quincena", "2da. Quincena", ...]
  quincenaActiva = null,    // string o null
  className = "",           // opcional para estilos externos
}) {
  // Blindajes
  const listaQ = Array.isArray(quincenas) ? quincenas : [];
  const listaF = Array.isArray(fechas) ? fechas : [];

  const index = listaQ.indexOf(quincenaActiva ?? "");
  const fecha = index >= 0 ? listaF[index] : null;

  const formatearFecha = (f) => {
    if (!f) return "";
    const [y, m, d] = String(f).split("-");
    if (!y || !m || !d) return String(f);
    return `${d}/${m}/${y}`;
  };

  return (
    <div className={`text-center mb-4 ${className}`}>
      {/* Tipo primero, luego nombre */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shadow">
          {proyecto?.tipo || "Rápido"}
        </span>
        <h2 className="text-2xl font-bold text-blue-900">
          {proyecto?.nombre || "Las Pilas 2"}
        </h2>
      </div>

      {/* Fechas (solo si hay match con la quincena activa) */}
      {fecha?.inicio && fecha?.fin && (
        <p className="mt-1 text-sm text-gray-800 font-medium">
          {formatearFecha(fecha.inicio)} - {formatearFecha(fecha.fin)}
        </p>
      )}
    </div>
  );
}
