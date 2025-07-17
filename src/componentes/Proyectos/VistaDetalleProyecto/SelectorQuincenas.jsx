import React from "react";
import { Plus } from "lucide-react";

export default function SelectorQuincenas({
  quincenas,
  quincenaActiva,
  setQuincenaActiva,
  agregarQuincena,
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {quincenas.map((q, idx) => (
        <button
          key={idx}
          onClick={() => setQuincenaActiva(q)}
          className={`h-10 px-4 rounded-full border text-sm sm:text-base shadow transition flex items-center ${
            quincenaActiva === q
              ? "bg-blue-100 text-blue-800 border-blue-400 font-semibold"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {q}
        </button>
      ))}

      <button
        onClick={agregarQuincena}
        className="h-10 w-10 flex items-center justify-center bg-green-200 text-green-800 rounded-full shadow hover:scale-110 transition"
        title="Agregar nueva quincena"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
