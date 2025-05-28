import React, { useState, useEffect } from "react";

export default function TotalIngresos({ ampliaciones, onCerrar }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [totalFiltrado, setTotalFiltrado] = useState(0);

  useEffect(() => {
    // Filtrar ampliaciones por fecha
    const ampliacionesFiltradas = ampliaciones.filter((a) => {
      const fecha = new Date(a.fecha);
      const inicio = fechaInicio ? new Date(fechaInicio) : null;
      const fin = fechaFin ? new Date(fechaFin) : null;

      // Comparar fechas si hay inicio y fin
      if (inicio && fecha < inicio) return false;
      if (fin && fecha > fin) return false;

      return true;
    });

    // Calcular total
    const suma = ampliacionesFiltradas.reduce(
      (total, a) => total + Number(a.monto),
      0
    );

    setTotalFiltrado(suma);
  }, [ampliaciones, fechaInicio, fechaFin]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">💰 Detalle de Ingresos</h3>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">
            Fecha inicio:
          </label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">
            Fecha fin:
          </label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-xl">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Total</th>
              <th className="py-2 px-4 text-left">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-2 px-4">Ingresos</td>
              <td className="py-2 px-4 font-semibold text-green-600">
                Q{totalFiltrado.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        onClick={onCerrar}
        className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded"
      >
        Cerrar
      </button>
    </div>
  );
}
