import { useState, useEffect } from "react";
import supabase from "../../supabase";
import { guardarLog } from "../../utils";

export default function PrecioTrabajos({ usuario }) {
  const [proyectos, setProyectos] = useState([]);
  const [trabajosPorProyecto, setTrabajosPorProyecto] = useState({});
  const [editandoProyectoId, setEditandoProyectoId] = useState(null);
  const [nuevosPrecios, setNuevosPrecios] = useState({});

  useEffect(() => {
    const cargarProyectosYTrabajos = async () => {
      const { data: proyectosData } = await supabase.from("proyectos").select("*");
      if (!proyectosData) {
        setProyectos([]);
        return;
      }
      setProyectos(proyectosData);

      const trabajosData = {};
      for (const proyecto of proyectosData) {
        const { data: trabajos } = await supabase
          .from("proyectos_trabajos")
          .select("*")
          .eq("proyecto_id", proyecto.id);

        trabajosData[proyecto.id] = trabajos || [];
      }

      setTrabajosPorProyecto(trabajosData);
    };

    cargarProyectosYTrabajos();
  }, []);

  const handleGuardarPrecios = async (proyectoId) => {
    const trabajos = trabajosPorProyecto[proyectoId];
    for (const trabajo of trabajos) {
      if (nuevosPrecios[trabajo.id] !== undefined) {
        const nuevoPrecio = parseFloat(nuevosPrecios[trabajo.id]);

        if (!isNaN(nuevoPrecio) && trabajo.id) {
          const { error } = await supabase
            .from("proyectos_trabajos")
            .update({
              precio_unitario: nuevoPrecio
            })
            .eq("id", trabajo.id);

          if (error) {
            console.error("Error al actualizar:", error);
          }
        }
      }
    }
    await guardarLog(
      usuario,
      "Actualización de precios",
      `El usuario actualizó los precios del proyecto ID: ${proyectoId}`
    );

    const actualizados = { ...trabajosPorProyecto };
    actualizados[proyectoId] = actualizados[proyectoId].map((trabajo) => ({
      ...trabajo,
      precio_unitario:
        nuevosPrecios[trabajo.id] !== undefined
          ? parseFloat(nuevosPrecios[trabajo.id])
          : trabajo.precio_unitario
    }));
    setTrabajosPorProyecto(actualizados);
    setEditandoProyectoId(null);
    setNuevosPrecios({});
  };

  return (
    <div className="p-4">
      {proyectos.map((proyecto) => (
        <div key={proyecto.id} className="bg-white rounded-lg shadow p-4 mb-4 relative">
          <h3 className="text-lg font-bold text-purple-700 mb-2">{proyecto.nombre}</h3>

          <div className="absolute top-2 right-2 flex gap-2">
            {editandoProyectoId === proyecto.id ? (
              <>
                <button
                  onClick={() => handleGuardarPrecios(proyecto.id)}
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditandoProyectoId(null);
                    setNuevosPrecios({});
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditandoProyectoId(proyecto.id);
                  const preciosIniciales = {};
                  trabajosPorProyecto[proyecto.id].forEach((trabajo) => {
                    preciosIniciales[trabajo.id] = trabajo.precio_unitario ?? "";
                  });
                  setNuevosPrecios(preciosIniciales);
                }}
                className="bg-blue-600 text-white px-2 py-1 rounded"
              >
                Editar
              </button>
            )}
          </div>

          {trabajosPorProyecto[proyecto.id]?.length > 0 ? (
            trabajosPorProyecto[proyecto.id].map((trabajo) => (
              <div key={trabajo.id} className="mt-4 p-4 bg-gray-50 rounded flex flex-wrap justify-around items-center">
                <div className="flex flex-col items-center flex-1 min-w-[100px]">
                  <p className="text-sm font-semibold text-gray-700">Nombre del Trabajo</p>
                  <p className="text-lg font-bold text-gray-800">{trabajo.nombre_trabajo}</p>
                </div>

                <div className="flex flex-col items-center flex-1 min-w-[100px]">
                  <p className="text-sm font-semibold text-gray-700">💵 Precio por Unidad</p>
                  {editandoProyectoId === proyecto.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={nuevosPrecios[trabajo.id] ?? ""}
                      onChange={(e) =>
                        setNuevosPrecios({
                          ...nuevosPrecios,
                          [trabajo.id]: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-center"
                    />
                  ) : (
                    <p className="text-lg font-bold text-green-700">
                      Q
                      {trabajo.precio_unitario !== undefined && trabajo.precio_unitario !== null
                        ? trabajo.precio_unitario.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "0.00"}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center flex-1 min-w-[100px]">
                  <p className="text-sm font-semibold text-gray-700">🔹 Unidades a Instalar</p>
                  <p className="text-lg font-bold text-gray-800">{trabajo.unidades_totales ?? 0}</p>
                </div>

                <div className="flex flex-col items-center flex-1 min-w-[100px]">
                  <p className="text-sm font-semibold text-gray-700">🔹 Total a Instalar</p>
                  <p className="text-lg font-bold text-gray-800">
                    Q
                    {(trabajo.precio_unitario && trabajo.unidades_totales)
                      ? (trabajo.precio_unitario * trabajo.unidades_totales).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "0.00"}
                  </p>
                </div>

                <div className="flex flex-col items-center flex-1 min-w-[100px]">
                  <p className="text-sm font-semibold text-gray-700">🔹 Unidades Instaladas</p>
                  <p className="text-lg font-bold text-gray-800">{trabajo.unidades_instaladas ?? 0}</p>
                </div>

                <div className="flex flex-col items-center flex-1 min-w-[100px]">
                  <p className="text-sm font-semibold text-gray-700">🔹 Total Instalado</p>
                  <p className="text-lg font-bold text-gray-800">
                    Q
                    {(trabajo.precio_unitario && trabajo.unidades_instaladas)
                      ? (trabajo.precio_unitario * trabajo.unidades_instaladas).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "0.00"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm mt-2">No hay trabajos para este proyecto.</p>
          )}
        </div>
      ))}
    </div>
  );
}
