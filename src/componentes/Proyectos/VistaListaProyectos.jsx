/**
 * Este componente muestra una lista de tarjetas con los proyectos disponibles.
 * Cada tarjeta permite:
 * - Ver el detalle del proyecto (click en cualquier parte de la tarjeta)
 * - Editar el proyecto (activando el modo edición)
 * - Eliminar el proyecto
 *
 * Recibe funciones desde el padre (Proyectos.jsx) que hacen la lógica real.
 */

import { Pencil, Trash2 } from "lucide-react";

export default function VistaListaProyectos({
  proyectos,
  supervisoresPorProyecto,
  cargarDatosProyecto,
  obtenerPersonal,
  setModoEdicion,
  setProyectoSeleccionado,
  eliminarProyecto,
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {proyectos.map((p) => (
        <div
          key={p.id}
          className="bg-white/30 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition relative"
        >
          {/* 🔹 Contenido principal del proyecto */}
          <div
            onClick={async () => {
              try {
                await cargarDatosProyecto(p);
                await obtenerPersonal(p);
                setProyectoSeleccionado(p);
              } catch (error) {
                console.error("Error al abrir detalle del proyecto:", error);
              }
            }}
            className="cursor-pointer"
          >
            <div className="text-lg font-semibold text-gray-800">{p.nombre}</div>
            <div className="text-sm text-gray-500 mb-2">
              {p.descripcion || "Sin descripción"}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <strong className="text-gray-700">Supervisor:</strong>{" "}
              {supervisoresPorProyecto[p.id] || "Sin asignar"}
            </div>
          </div>

          {/* 🔸 Botones de acción: editar y eliminar */}
          <div className="flex gap-2 absolute top-2 right-2">
            <button
              onClick={async (e) => {
                e.stopPropagation(); // Evita que se dispare el onClick general
                try {
                  setModoEdicion(true);
                  await cargarDatosProyecto(p);
                  await obtenerPersonal(p);
                  setProyectoSeleccionado(p);
                } catch (error) {
                  console.error("Error al editar proyecto:", error);
                }
              }}
              className="text-blue-600 hover:text-blue-800"
              title="Editar"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Evita abrir el modal al eliminar
                eliminarProyecto(p.id);
              }}
              className="text-red-600 hover:text-red-800"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
