import React from "react";

// 🔹 Recibe también las fechas y la quincena activa
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
      <h2 className="text-2xl font-bold text-blue-900">{proyecto?.nombre || "Las Pilas"}</h2>

      <span className="inline-block mt-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow">
        {proyecto?.tipo || "Rápido"}
      </span>

      {fecha?.inicio && fecha?.fin && (
        <p className="mt-1 text-sm text-gray-800 font-medium">
          {formatearFecha(fecha.inicio)} - {formatearFecha(fecha.fin)}
        </p>
      )}
    </div>
  );
}
