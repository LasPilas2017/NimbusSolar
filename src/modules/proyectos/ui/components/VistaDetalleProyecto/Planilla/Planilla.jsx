// src/VistaDetalleProyecto/Planilla/Planilla.jsx
import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import PlanillaPorDias from "./PlanillaPorDias.jsx";
import "./EstiloExcelPlanilla.css";

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

const GTQ = (n) =>
  "Q" + Number(n || 0).toLocaleString("es-GT", { maximumFractionDigits: 0 });

export default function Planilla() {
  const totalExtras      = datos.reduce((s, p) => s + p.extras, 0);
  const totalQ           = datos.reduce((s, p) => s + p.total, 0);
  const totalAsistencia  = datos.reduce((s, p) => s + p.asistencia, 0);
  const totalProduccion  = datos.reduce((s, p) => s + p.produccion, 0);
  const totalHoras       = datos.reduce((s, p) => s + p.horas, 0);

  return (
    <div className="flex w-full items-start">
      {/* ===== IZQUIERDA: resumen trabajadores ===== */}
      <div className="table-planilla no-freeze planilla-left w-[45%]">
        {/* scroll horizontal SOLO si no cabe */}
        <div className="scroll-x">
          {/* min-w ajustado (compacto). si lo querés aún más chico, baja a 720px */}
          <table className="min-w-[600px]">
            <thead>
              <tr>
                <th className="st-idx">#</th>
                <th className="st-acciones">Acciones</th>
                <th className="st-nombre">Nombre</th>
                <th>Extras Totales</th>
                <th>Total (Q)</th>
                <th>B. Asistencia</th>
                <th>B. Producción</th>
                <th>Horas</th>
              </tr>

              <tr className="totales">
                <th className="st-idx"></th>
                <th className="st-acciones"></th>
                <th className="st-nombre td-right">Totales:</th>
                <th className="td-center">{totalExtras}</th>
                <th className="td-center">{GTQ(totalQ)}</th>
                <th className="td-center">{GTQ(totalAsistencia)}</th>
                <th className="td-center">{GTQ(totalProduccion)}</th>
                <th className="td-center">{totalHoras}</th>
              </tr>

              <tr className="separador">
                <th colSpan={8}></th>
              </tr>
            </thead>

            <tbody>
              {datos.map((p, i) => (
                <tr key={p.id}>
                  <td className="st-idx td-center">{i + 1}</td>
                  <td className="st-acciones">
                    <div className="flex justify-center gap-2">
                      <FiEdit2 className="cursor-pointer" />
                      <FiTrash2 className="cursor-pointer" />
                    </div>
                  </td>
                  <td className="st-nombre">{p.nombre}</td>
                  <td className="td-center">{p.extras}</td>
                  <td className="td-center">{GTQ(p.total)}</td>
                  <td className="td-center">{GTQ(p.asistencia)}</td>
                  <td className="td-center">{GTQ(p.produccion)}</td>
                  <td className="td-center">{p.horas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DERECHA: por días ===== */}
      <div className="table-planilla w-[70%] min-w-0">
        <PlanillaPorDias datos={datos} />
      </div>
    </div>
  );
}
