import React, { useState, useEffect } from "react";

export default function TotalEgresos({ gastos, onCerrar }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [totalFiltrado, setTotalFiltrado] = useState(0);

  useEffect(() => {
    // Filtrar gastos por fecha
    const gastosFiltrados = gastos.filter((g) => {
      const fecha = new Date(g.fecha);
      const inicio = fechaInicio ? new Date(fechaInicio) : null;
      const fin = fechaFin ? new Date(fechaFin) : null;

      if (inicio && fecha < inicio) return false;
      if (fin && fecha > fin) return false;

      return true;
    });

    // Calcular total
    const suma = gastosFiltrados.reduce(
      (total, g) => total + Number(g.monto),
      0
    );

    setTotalFiltrado(suma);
  }, [gastos, fechaInicio, fechaFin]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">💸 Detalle de Egresos</h3>

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
              <td className="py-2 px-4">Egresos</td>
              <td className="py-2 px-4 font-semibold text-red-600">
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
