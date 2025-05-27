// ReporteYModificacionPersonal.jsx
import { useState } from "react";
import { Plus, Pencil, FileText } from "lucide-react";

export default function ReporteYModificacionPersonal({ persona }) {
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [presento, setPresento] = useState("Sí");
  const [unidades, setUnidades] = useState(0);
  const [unidadesMeta, setUnidadesMeta] = useState(0);
  return (
    <div className="p-4 border border-gray-300 rounded-2xl shadow bg-white mb-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-bold text-gray-800">{persona.nombrecompleto}</h4>
        <button
          onClick={() => setMostrarResumen(!mostrarResumen)}
          className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition"
        >
          <Plus />
        </button>
      </div>

      {mostrarResumen && (
        <div className="mt-4 p-4 bg-gray-50 rounded-2xl shadow-inner">
          <p className="mb-3 font-medium text-gray-700">
            📅 Resumen diario de {persona.nombrecompleto}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <button className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-xl px-3 py-1 transition">
              <Pencil size={16} /> Modificar trabajos
            </button>
            <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-3 py-1 transition">
              <FileText size={16} /> Reportar día
            </button>
          </div>

          {/* Formulario dinámico para Reportar día */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-1">
                ¿Se presentó a trabajar?
              </label>
              <select
                value={presento}
                onChange={(e) => setPresento(e.target.value)}
                className="border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            {presento === "Sí" && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Pago por día
                  </label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Horas extras
                  </label>
                  <input
                    type="number"
                    className="border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Unidades para meta
                  </label>
                  <input
                    type="number"
                    value={unidadesMeta}
                    onChange={(e) => setUnidadesMeta(Number(e.target.value))}
                    className="border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Unidades reportadas
                  </label>
                  <input
                    type="number"
                    value={unidades}
                    onChange={(e) => setUnidades(Number(e.target.value))}
                    className="border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                {unidades > unidadesMeta && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 font-medium mb-1">
                      Bonificación por unidades extras
                    </label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    Grupo
                  </label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-xl p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
