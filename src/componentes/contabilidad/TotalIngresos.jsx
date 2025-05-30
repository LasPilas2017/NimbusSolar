import React, { useState, useEffect } from "react";

export default function TotalIngresos({ ampliaciones, proyectos, onCerrar }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Filtrar ampliaciones por fecha
  const ampliacionesFiltradas = ampliaciones.filter((a) => {
    const fecha = new Date(a.fecha);
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;

    if (inicio && fecha < inicio) return false;
    if (fin && fecha > fin) return false;

    return true;
  });

  // Calcular total
  const total = ampliacionesFiltradas.reduce((sum, a) => sum + Number(a.monto), 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">💰 Detalle de Ingresos</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha inicio:</label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha fin:</label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla con la información completa */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-xl">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Proyecto</th>
              <th className="py-2 px-4 text-left">Documento</th>
              <th className="py-2 px-4 text-left">Medio</th>
              <th className="py-2 px-4 text-left">Fecha</th>
              <th className="py-2 px-4 text-left">Monto</th>
            </tr>
          </thead>
          <tbody>
            {ampliacionesFiltradas.map((a) => {
              const proyecto = proyectos.find((p) => p.id === a.proyecto_id);
              return (
                <tr key={a.id} className="border-t">
                  <td className="py-2 px-4">{proyecto ? proyecto.nombre : "Sin nombre"}</td>
                  <td className="py-2 px-4">{a.documento}</td>
                  <td className="py-2 px-4 capitalize">{a.medio}</td>
                  <td className="py-2 px-4">{a.fecha}</td>
                  <td className="py-2 px-4 font-semibold text-green-600">
                    Q{Number(a.monto).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total de ingresos */}
      <div className="mt-4 text-right font-semibold text-lg text-green-700">
        Total: Q{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Botón para cerrar */}
      <button
        onClick={onCerrar}
        className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded"
      >
        Cerrar
      </button>
    </div>
  );
}
