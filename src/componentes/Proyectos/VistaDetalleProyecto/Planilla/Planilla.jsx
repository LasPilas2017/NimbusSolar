// Planilla.jsx
import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import PlanillaPorDias from "./PlanillaPorDias.jsx";


const datos = [
  { id: 1, nombre: 'Juan',   extras: 0, total: 170, asistencia: 100, produccion: 50, horas: 20 },
  { id: 2, nombre: 'Pedro',  extras: 0, total: 170, asistencia: 100, produccion: 50, horas: 20 },
  { id: 3, nombre: 'María',  extras: 2, total: 185, asistencia: 95,  produccion: 60, horas: 22 },
  { id: 4, nombre: 'Luis',   extras: 1, total: 175, asistencia: 90,  produccion: 55, horas: 18 },
  { id: 5, nombre: 'Ana',    extras: 3, total: 190, asistencia: 100, produccion: 65, horas: 25 },
  { id: 6, nombre: 'Carlos', extras: 0, total: 160, asistencia: 85,  produccion: 45, horas: 19 },
  { id: 7, nombre: 'Sofía',  extras: 1, total: 172, asistencia: 92,  produccion: 52, horas: 21 },
  { id: 8, nombre: 'Diego',  extras: 0, total: 168, asistencia: 88,  produccion: 48, horas: 20 },
  { id: 9, nombre: 'Laura',  extras: 2, total: 180, asistencia: 96,  produccion: 58, horas: 23 },
  { id: 10, nombre: 'Andrés',extras: 0, total: 165, asistencia: 90,  produccion: 50, horas: 19 },
  { id: 11, nombre: 'Camila',extras: 1, total: 178, asistencia: 94,  produccion: 55, horas: 22 },
  { id: 12, nombre: 'Mateo', extras: 0, total: 170, asistencia: 100, produccion: 50, horas: 20 },
  { id: 13, nombre: 'Valeria',extras: 3,total: 195, asistencia: 98,  produccion: 65, horas: 24 },
  { id: 14, nombre: 'Jorge', extras: 0, total: 160, asistencia: 85,  produccion: 45, horas: 18 },
  { id: 15, nombre: 'Paola', extras: 1, total: 175, asistencia: 92,  produccion: 53, horas: 21 },
];


export default function Planilla() {
  const totalExtras = datos.reduce((sum, p) => sum + p.extras, 0);
  const totalQ = datos.reduce((sum, p) => sum + p.total, 0);
  const totalAsistencia = datos.reduce((sum, p) => sum + p.asistencia, 0);
  const totalProduccion = datos.reduce((sum, p) => sum + p.produccion, 0);
  const totalHoras = datos.reduce((sum, p) => sum + p.horas, 0);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Tabla Resumen Personal */}
      <div className="overflow-x-auto border border-black w-full md:w-1/2">
        <table className="min-w-full text-xs text-center border-collapse border border-black">
          <thead>
            {/* Fila Vacía */}
                <tr className="h-6">
                  <td colSpan="8" className="border border-black"></td>
                </tr>
            {/* Fila de Totales */}
            <tr className="font-semibold">
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1 py-1 text-right">Totales:</td>
              <td className="border border-black px-1 py-1">{totalExtras}</td>
              <td className="border border-black px-1 py-1">Q{totalQ}</td>
              <td className="border border-black px-1 py-1">Q{totalAsistencia}</td>
              <td className="border border-black px-1 py-1">Q{totalProduccion}</td>
              <td className="border border-black px-1 py-1">{totalHoras}</td>
            </tr>
                
            {/* Encabezados */}
            <tr className="font-semibold">
              <th className="border border-black px-1 py-1">#</th>
              <th className="border border-black px-1 py-1">Acciones</th>
              <th className="border border-black px-1 py-1">Nombre</th>
              <th className="border border-black px-1 py-1">Extras Totales</th>
              <th className="border border-black px-1 py-1">Total (Q)</th>
              <th className="border border-black px-1 py-1">B. Asistencia</th>
              <th className="border border-black px-1 py-1">B. Producción</th>
              <th className="border border-black px-1 py-1">Horas</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((persona, index) => (
              <tr key={persona.id}>
                <td className="border border-black px-1 py-1">{index + 1}</td>
                <td className="border border-black px-1 py-1">
                  <div className="flex justify-center gap-2">
                    <FiEdit2 className="cursor-pointer" />
                    <FiTrash2 className="cursor-pointer" />
                  </div>
                </td>
                <td className="border border-black px-1 py-1">{persona.nombre}</td>
                <td className="border border-black px-1 py-1">{persona.extras}</td>
                <td className="border border-black px-1 py-1">Q{persona.total}</td>
                <td className="border border-black px-1 py-1">Q{persona.asistencia}</td>
                <td className="border border-black px-1 py-1">Q{persona.produccion}</td>
                <td className="border border-black px-1 py-1">{persona.horas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de días con scroll */}
      <div className="w-full md:w-1/2">
        <PlanillaPorDias datos={datos} />
      </div>
    </div>
  );
}