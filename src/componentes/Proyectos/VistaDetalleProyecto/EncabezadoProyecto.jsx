import React from "react";

// 🔹 Recibe también las fechas y la quincena activa
export default function EncabezadoProyecto({ proyecto, fechas, quincenas, quincenaActiva }) {
  // 🔹 Buscamos el índice de la quincena activa para encontrar la fecha correspondiente
  const index = quincenas.indexOf(quincenaActiva);
  const fecha = fechas[index];

  // 🔹 Función para mostrar en formato dd/mm/aaaa
  const formatearFecha = (f) => {
    if (!f) return "";
    const [y, m, d] = f.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="text-center mb-4">
      <h2 className="text-2xl font-bold text-purple-800">{proyecto?.nombre || "Sin nombre"}</h2>
      <span className="inline-block mt-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full shadow">
        {proyecto?.tipo || "Sin tipo"}
      </span>

      {/* 🔹 Mostramos el rango de fechas solo si están definidas */}
      {fecha?.inicio && fecha?.fin && (
        <p className="mt-1 text-sm text-gray-800 font-medium">
          {formatearFecha(fecha.inicio)} - {formatearFecha(fecha.fin)}
        </p>
      )}
    </div>
  );
}
