import React from "react";

export default function EncabezadoProyecto({ proyecto, fechas, quincenas, quincenaActiva }) {
  const index = quincenas.indexOf(quincenaActiva);
  const fecha = fechas[index];

  const formatearFecha = (f) => {
    if (!f) return "";
    const [y, m, d] = f.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="text-center mb-4">
      {/* 🔹 Tipo primero, luego nombre */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shadow">
          {proyecto?.tipo || "Rápido"}
        </span>
        <h2 className="text-2xl font-bold text-blue-900">{proyecto?.nombre || "Las Pilas"}</h2>
      </div>

      {/* 🔹 Fechas */}
      {fecha?.inicio && fecha?.fin && (
        <p className="mt-1 text-sm text-gray-800 font-medium">
          {formatearFecha(fecha.inicio)} - {formatearFecha(fecha.fin)}
        </p>
      )}
    </div>
  );
}
