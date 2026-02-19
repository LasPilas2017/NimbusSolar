// src/componentes/Proyectos/VistaDetalleProyecto/ContenedorPrincipal/SelectorQuincenas.jsx
import React from "react";

export default function SelectorQuincenas({
  quincenas = [],           // array de labels
  activeIndex = null,       // índice activo o null
  onSelectIndex = () => {}, // (idx|null) => void
  agregarQuincena = () => {},
}) {
  return (
    <div className="flex items-center gap-3">
      {quincenas.map((label, idx) => (
        <button
          key={`${label}-${idx}`}
          onClick={() => onSelectIndex(idx)}
          className={`h-10 px-4 py-2 text-sm font-medium shadow transition rounded-none ${
            activeIndex === idx ? "bg-blue-900 text-white" : "border border-blue-900 text-blue-900 hover:bg-blue-100"
          }`}
        >
          {label}
        </button>
      ))}

      <button
        onClick={agregarQuincena}
        aria-label="Agregar quincena"
        className="h-10 w-10 rounded-none bg-green-600 text-white hover:bg-green-700 shadow flex items-center justify-center text-xl"
      >
        +
      </button>
    </div>
  );
}
