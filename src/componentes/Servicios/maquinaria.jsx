// Maquinaria.jsx
import { useState } from "react";
import { Hammer, ClipboardList, Wrench } from "lucide-react";

export default function Maquinaria() {
  const [vistaMaquinaria, setVistaMaquinaria] = useState("principal");

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Maquinaria</h1>

      {/* Vista principal con las tarjetas */}
      {vistaMaquinaria === "principal" && (
        <div className="flex flex-wrap justify-center gap-6">
          {/* Tarjeta 1: Ingreso Nueva Maquinaria */}
          <div
            onClick={() => setVistaMaquinaria("ingreso")}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-64 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Hammer size={48} className="text-green-600 mb-2" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ingreso Nueva Maquinaria</h2>
            <p className="text-gray-600 text-center text-sm">Registra nueva maquinaria de corte de grama.</p>
          </div>

          {/* Tarjeta 2: Reporte de Trabajos */}
          <div
            onClick={() => setVistaMaquinaria("trabajos")}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-64 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <ClipboardList size={48} className="text-blue-600 mb-2" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Reporte de Trabajos</h2>
            <p className="text-gray-600 text-center text-sm">Registra horas, lugar y consumo de combustible.</p>
          </div>

          {/* Tarjeta 3: Reporte de Servicios */}
          <div
            onClick={() => setVistaMaquinaria("servicios")}
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-64 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <Wrench size={48} className="text-red-600 mb-2" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Reporte de Servicios</h2>
            <p className="text-gray-600 text-center text-sm">Registra servicios, reparaciones y repuestos.</p>
          </div>
        </div>
      )}

      {/* Formulario de Ingreso Nueva Maquinaria */}
      {vistaMaquinaria === "ingreso" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full max-w-md flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Ingreso Nueva Maquinaria</h2>
          <input type="text" placeholder="Nombre" className="border border-gray-300 rounded p-2" />
          <input type="text" placeholder="Descripción" className="border border-gray-300 rounded p-2" />
          <input type="number" placeholder="Horas trabajadas (iniciales)" className="border border-gray-300 rounded p-2" />
          <button className="bg-green-600 text-white rounded p-2 hover:bg-green-700 transition">Guardar</button>
          <button onClick={() => setVistaMaquinaria("principal")} className="text-sm text-gray-600 hover:underline">← Volver</button>
        </div>
      )}

      {/* Formulario de Reporte de Trabajos */}
      {vistaMaquinaria === "trabajos" && (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full max-w-md flex flex-col gap-4">
    <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Reporte de Trabajos</h2>

    {/* Horómetro de inicio */}
    <input
      type="number"
      placeholder="Horómetro de inicio"
      className="border border-gray-300 rounded p-2"
    />

    {/* Horómetro final */}
    <input
      type="number"
      placeholder="Horómetro final"
      className="border border-gray-300 rounded p-2"
    />

    {/* Lugar de trabajo */}
    <input
      type="text"
      placeholder="Lugar de trabajo"
      className="border border-gray-300 rounded p-2"
    />

    {/* Consumo de combustible */}
    <select className="border border-gray-300 rounded p-2">
      <option value="">Consumo de combustible</option>
      <option value="0.25">1/4 galón</option>
      <option value="0.5">1/2 galón</option>
      <option value="0.75">3/4 galón</option>
      <option value="1">1 galón</option>
      <option value="2">2 galones</option>
      <option value="3">3 galones</option>
      <option value="4">4 galones</option>
      <option value="5">5 galones</option>
    </select>

    {/* Botón de guardar */}
    <button className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 transition">
      Guardar Reporte
    </button>

    {/* Botón de volver */}
    <button
      onClick={() => setVistaMaquinaria("principal")}
      className="text-sm text-gray-600 hover:underline"
    >
      ← Volver
    </button>
  </div>
)}

      

      {/* Formulario de Reporte de Servicios */}
      {vistaMaquinaria === "servicios" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 w-full max-w-md flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Reporte de Servicios</h2>
          <input type="number" placeholder="Hora de Servicio" className="border border-gray-300 rounded p-2" />
          <select className="border border-gray-300 rounded p-2">
            <option value="">Tipo de Servicio</option>
            <option value="servicio">Servicio</option>
            <option value="reparacion">Reparación</option>
          </select>
          <textarea placeholder="Repuestos a cambiar" className="border border-gray-300 rounded p-2" rows="2"></textarea>
          <input type="date" placeholder="Fecha de cambio" className="border border-gray-300 rounded p-2" />
          <input type="number" placeholder="Costo" className="border border-gray-300 rounded p-2" />
          <input type="text" placeholder="Proveedor" className="border border-gray-300 rounded p-2" />
          <input type="text" placeholder="Lugar de Servicio" className="border border-gray-300 rounded p-2" />
          <button className="bg-red-600 text-white rounded p-2 hover:bg-red-700 transition">Guardar Servicio</button>
          <button onClick={() => setVistaMaquinaria("principal")} className="text-sm text-gray-600 hover:underline">← Volver</button>
        </div>
      )}
    </div>
  );
}
