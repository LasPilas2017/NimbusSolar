// SelectorQuincenas.jsx
import React from "react";
import { FiPlus } from "react-icons/fi";
import { Plus } from "lucide-react";

export default function SelectorQuincenas({
  quincenas,
  quincenaActiva,
  setQuincenaActiva,
  agregarQuincena,
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
      {quincenas.map((q, idx) => (
        <button
          key={idx}
          onClick={() => setQuincenaActiva(q)}
          className={`px-4 py-1 rounded-full border text-sm sm:text-base shadow transition ${
            quincenaActiva === q
              ? "bg-purple-100 text-purple-800 border-purple-400 font-semibold"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {q}
        </button>
      ))}

      <button
          onClick={agregarQuincena}
          className="bg-green-200 text-green-800 p-2 rounded-full shadow hover:scale-110 transition"
          title="Agregar nueva quincena"
        >
          <Plus size={18} />
        </button>
    </div>
  );
}
