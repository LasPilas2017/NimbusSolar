// Vehiculos.jsx
import { useState } from "react";
import { Car, ClipboardList } from "lucide-react";

export default function Vehiculos() {
  const [vistaVehiculo, setVistaVehiculo] = useState("principal");

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Vehículos</h1>

      {vistaVehiculo === "principal" && (
        <div className="flex flex-wrap justify-center gap-6">
          {/* Tarjeta Ingreso Vehículo */}
          <div
            onClick={() => setVistaVehiculo("ingreso")}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-64 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Car size={48} className="text-green-600 mb-2" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Agregar Vehículo</h2>
            <p className="text-gray-600 text-center text-sm">Registra un nuevo vehículo.</p>
          </div>

          {/* Tarjeta Servicios Vehículo */}
          <div
            onClick={() => setVistaVehiculo("servicios")}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-64 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <ClipboardList size={48} className="text-blue-600 mb-2" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Servicios</h2>
            <p className="text-gray-600 text-center text-sm">Registra y controla el próximo servicio.</p>
          </div>
        </div>
      )}

      {/* Formulario de Ingreso de Vehículo */}
      {vistaVehiculo === "ingreso" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full max-w-md flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Agregar Vehículo</h2>
          <input type="text" placeholder="Placa" className="border border-gray-300 rounded p-2" />
          <input type="text" placeholder="Color" className="border border-gray-300 rounded p-2" />
          <input type="number" placeholder="Año" className="border border-gray-300 rounded p-2" />
          <input type="number" placeholder="Kilometraje actual" className="border border-gray-300 rounded p-2" />
          <button className="bg-green-600 text-white rounded p-2 hover:bg-green-700 transition">Guardar Vehículo</button>
          <button onClick={() => setVistaVehiculo("principal")} className="text-sm text-gray-600 hover:underline">← Volver</button>
        </div>
      )}

      {/* Formulario de Servicios Vehículo */}
      {vistaVehiculo === "servicios" && (
        <ServiciosVehiculo onBack={() => setVistaVehiculo("principal")} />
      )}
    </div>
  );
}

// Subcomponente: formulario de servicios
function ServiciosVehiculo({ onBack }) {
  const vehiculos = [
    { placa: "ABC123", color: "Rojo", anio: 2019, kilometraje: 30000 },
    { placa: "XYZ789", color: "Azul", anio: 2021, kilometraje: 15000 },
  ];

  const opcionesSiguienteServicio = [5000, 8000, 10000]; // Opciones en km
  const tiposDeServicio = [
    "Cambio de aceite",
    "Revisión de frenos",
    "Cambio de llantas",
    "Revisión general",
    "Otro",
  ];

  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [kmSiguiente, setKmSiguiente] = useState(0);
  const [tipoServicio, setTipoServicio] = useState("");
  const [comentario, setComentario] = useState("");

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full max-w-md flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Registrar Servicio</h2>

      {/* Seleccionar vehículo */}
      <select
        onChange={(e) => {
          const seleccionado = vehiculos.find(v => v.placa === e.target.value);
          setVehiculoSeleccionado(seleccionado);
        }}
        className="border border-gray-300 rounded p-2"
      >
        <option value="">Seleccione un vehículo</option>
        {vehiculos.map((v, i) => (
          <option key={i} value={v.placa}>{v.placa}</option>
        ))}
      </select>

      {/* Mostrar datos del vehículo */}
      {vehiculoSeleccionado && (
        <div className="flex flex-col gap-2 text-sm text-gray-700">
          <div>Color: {vehiculoSeleccionado.color}</div>
          <div>Año: {vehiculoSeleccionado.anio}</div>
          <div>Placa: {vehiculoSeleccionado.placa}</div>
          <div>Kilometraje actual: {vehiculoSeleccionado.kilometraje} km</div>
        </div>
      )}

      {/* Selección del próximo servicio y otros datos */}
      {vehiculoSeleccionado && (
        <>
          <select
            onChange={(e) => setKmSiguiente(parseInt(e.target.value))}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">Seleccione el kilometraje para el próximo servicio</option>
            {opcionesSiguienteServicio.map((km, i) => (
              <option key={i} value={km}>{km} km</option>
            ))}
          </select>

          <select
            onChange={(e) => setTipoServicio(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">Seleccione el tipo de servicio realizado</option>
            {tiposDeServicio.map((tipo, i) => (
              <option key={i} value={tipo}>{tipo}</option>
            ))}
          </select>

          <textarea
            placeholder="Comentario o descripción del servicio realizado"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="border border-gray-300 rounded p-2"
            rows="3"
          ></textarea>

          {kmSiguiente > 0 && (
            <div className="text-sm text-gray-700">
              Siguiente servicio a los:{" "}
              <strong>{vehiculoSeleccionado.kilometraje + kmSiguiente} km</strong>
            </div>
          )}

          <button className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 transition">Guardar Servicio</button>
        </>
      )}

      <button onClick={onBack} className="text-sm text-gray-600 hover:underline">← Volver</button>
    </div>
  );
}
