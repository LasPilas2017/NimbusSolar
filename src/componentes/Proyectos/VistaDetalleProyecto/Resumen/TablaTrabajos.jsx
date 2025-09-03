// TablaTrabajos.jsx
import React from "react";
import { FiEdit, FiTrash } from "react-icons/fi";

export default function TablaTrabajos() {
  const trabajos = [
    {
      id: 1,
      nombre: "Instalación de paneles",
      precioUnitario: 20,
      cantidad: 50,
      avance: 40,
    },
    {
      id: 2,
      nombre: "Colocación de hincas",
      precioUnitario: 15,
      cantidad: 40,
      avance: 30,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-8 overflow-x-auto">
      <h2 className="text-lg font-semibold text-center mb-4 text-gray-700">
        Trabajos a Realizar
      </h2>

      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="text-gray-600 border-b">
            <th className="p-2">Trabajo</th>
            <th className="p-2">Precio Unitario</th>
            <th className="p-2">Precio Total</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Avance</th>
            <th className="p-2">Pendiente</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trabajos.map((trabajo) => {
            const pendiente = trabajo.cantidad - trabajo.avance;
            const total = trabajo.precioUnitario * trabajo.cantidad;

            return (
              <tr key={trabajo.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{trabajo.nombre}</td>
                <td className="p-2">Q{trabajo.precioUnitario.toFixed(2)}</td>
                <td className="p-2">Q{total.toFixed(2)}</td>
                <td className="p-2">{trabajo.cantidad}</td>
                <td className="p-2">{trabajo.avance}</td>
                <td className="p-2">{pendiente}</td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FiEdit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <FiTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
