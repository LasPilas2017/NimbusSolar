// Servicios.jsx
import { Truck, Hammer } from "lucide-react";

export default function Servicios({ onSelect }) {
  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Servicios</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {/* Tarjeta para Vehículos */}
        <div
          onClick={() => onSelect("vehiculos")}
          className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-64 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <Truck size={48} className="text-green-600 mb-2" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Vehículos</h2>
          <p className="text-gray-600 text-center text-sm">
            Haz clic aquí para ver o registrar los servicios de los vehículos.
          </p>
        </div>

        {/* Tarjeta para Maquinaria */}
        <div
          onClick={() => onSelect("maquinaria")}
          className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-64 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <Hammer size={48} className="text-blue-600 mb-2" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Maquinaria</h2>
          <p className="text-gray-600 text-center text-sm">
            Haz clic aquí para ver o registrar los servicios de la maquinaria (chapeadoras y strill incluidas).
          </p>
        </div>
      </div>
    </div>
  );
}
