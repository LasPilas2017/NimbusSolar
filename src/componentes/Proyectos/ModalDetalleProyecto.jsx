import { useEffect, useState } from "react";
import AsignacionPersonal from "./AsignacionPersonal";
import TrabajosPorRealizar from "./TrabajosPorRealizar";
import supabase from "../../supabase";

export default function ModalDetalleProyecto({
  modoEdicion,
  setModoEdicion,
  proyectoSeleccionado,
  setProyectoSeleccionado,
  nuevoProyecto,
  setNuevoProyecto,
  personalDisponible,
  setPersonalDisponible,
  supervisoresSeleccionados,
  setSupervisoresSeleccionados,
  trabajadoresSeleccionados,
  setTrabajadoresSeleccionados,
  trabajos,
  setTrabajos,
  trabajosProyecto,
  personalAsignado,
  gastosProyecto,
  obtenerProyectos,
  obtenerPersonal,
}) {
  const [cargando, setCargando] = useState(false);
  const [categoriasIngreso, setCategoriasIngreso] = useState([]);

  useEffect(() => {
    if (!proyectoSeleccionado) return;

    const cargarAsignados = async () => {
      setCargando(true);
      try {
        const [supRes, trabRes] = await Promise.all([
          supabase
            .from("proyectos_personal")
            .select("trabajador_id")
            .eq("proyecto_id", proyectoSeleccionado.id)
            .eq("rol", "supervisor"),
          supabase
            .from("proyectos_personal")
            .select("trabajador_id")
            .eq("proyecto_id", proyectoSeleccionado.id)
            .eq("rol", "trabajador"),
        ]);

        const ids = [...(supRes.data || []), ...(trabRes.data || [])].map((p) => p.trabajador_id);

        const { data: personasRes } = await supabase
          .from("registrodepersonal")
          .select("id, nombrecompleto")
          .in("id", ids);

        setSupervisoresSeleccionados(supRes.data?.map((s) => s.trabajador_id) || []);
        setTrabajadoresSeleccionados(trabRes.data?.map((t) => t.trabajador_id) || []);
        setPersonalDisponible(personasRes || []);
      } catch (error) {
        console.error("Error al cargar personal asignado:", error);
      }
      setCargando(false);
    };

    cargarAsignados();
  }, [proyectoSeleccionado]);

  useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias_contables")
        .select("id, nombre")
        .eq("tipo", "ingreso");

      if (!error) setCategoriasIngreso(data);
    };

    cargarCategorias();
  }, []);

  const cerrarModal = () => {
    setProyectoSeleccionado(null);
    setModoEdicion(false);
  };

 const guardarCambios = async () => {
  // 🔸 Actualizar los datos principales del proyecto
  const { error } = await supabase
    .from("proyectos")
    .update({
      nombre: nuevoProyecto.nombre,
      descripcion: nuevoProyecto.descripcion,
      categoria_id: nuevoProyecto.categoria_id || null,
    })
    .eq("id", proyectoSeleccionado.id);

  if (error) {
    console.error("Error al actualizar proyecto:", error);
    alert("Error al guardar cambios");
    return;
  }

  // 🔸 Eliminar personal anterior y volver a insertar supervisores y trabajadores
  await supabase.from("proyectos_personal").delete().eq("proyecto_id", proyectoSeleccionado.id);

  await supabase.from("proyectos_personal").insert(
    supervisoresSeleccionados.map((id) => ({
      proyecto_id: proyectoSeleccionado.id,
      trabajador_id: id,
      rol: "supervisor",
    }))
  );

  await supabase.from("proyectos_personal").insert(
    trabajadoresSeleccionados.map((id) => ({
      proyecto_id: proyectoSeleccionado.id,
      trabajador_id: id,
      rol: "trabajador",
    }))
  );

  // 🔸 Eliminar trabajos anteriores y registrar los nuevos
  await supabase.from("proyectos_trabajos").delete().eq("proyecto_id", proyectoSeleccionado.id);

  await supabase.from("proyectos_trabajos").insert(
    trabajos
      .filter((t) => t.nombre.trim() !== "" && parseInt(t.unidades))
      .map((t) => ({
        proyecto_id: proyectoSeleccionado.id,
        nombre_trabajo: t.nombre.trim(),
        unidades_totales: parseInt(t.unidades, 10),
      }))
  );

  alert("Cambios guardados correctamente");
  setModoEdicion(false);

  // 🔸 Recargar la lista de proyectos y actualizar los supervisores en vista principal
  await obtenerProyectos();
  await obtenerSupervisores(); // ✅ Actualiza los supervisores visibles tras editar
};


  if (!proyectoSeleccionado) {
    
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-white text-xl font-semibold">
      Cargando proyecto...
    </div>
  );
}

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-center items-start px-4 py-10 overflow-y-scroll scrollbar-hide">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-5xl relative">
        <button
          className="absolute top-3 right-4 text-red-600 font-bold text-3xl p-2 hover:scale-110 transition-transform duration-200"
          onClick={cerrarModal}
        >
          ×
        </button>

        {/* Título con chip de categoría */}
        <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-3">
          {modoEdicion ? (
            "✏️ Editar proyecto"
          ) : (
            <>
              {proyectoSeleccionado.nombre}
              {proyectoSeleccionado.categorias_contables?.nombre && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                  {proyectoSeleccionado.categorias_contables.nombre}
                </span>
              )}
            </>
          )}
        </h2>

        {cargando ? (
          <div className="text-center py-10 text-gray-600 font-medium animate-pulse">
            Cargando datos del proyecto...
          </div>
        ) : (
          <>
            {/* Nombre del proyecto */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                value={(modoEdicion ? nuevoProyecto.nombre : proyectoSeleccionado.nombre) ?? ""}
                disabled={!modoEdicion}
                onChange={(e) =>
                  setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })
                }
                className={`w-full p-2 border rounded-xl ${
                  !modoEdicion ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Descripción del proyecto */}
            <textarea
              value={
                (modoEdicion ? nuevoProyecto.descripcion : proyectoSeleccionado.descripcion) ?? ""
              }
              disabled={!modoEdicion}
              onChange={(e) =>
                setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })
              }
              className={`w-full p-2 border rounded-xl mb-3 ${
                !modoEdicion ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            {/* Select de categoría en modo edición */}
            {modoEdicion && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría del proyecto
                </label>
                <select
                  value={nuevoProyecto.categoria_id || ""}
                  onChange={(e) =>
                    setNuevoProyecto({ ...nuevoProyecto, categoria_id: e.target.value })
                  }
                  className="w-full p-2 border rounded-xl"
                >
                  <option value="">Selecciona una categoría</option>
                  {categoriasIngreso.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Personal asignado */}
            <AsignacionPersonal
              modoEdicion={modoEdicion}
              mostrarFormulario={false}
              personalDisponible={personalDisponible}
              supervisoresSeleccionados={supervisoresSeleccionados}
              setSupervisoresSeleccionados={setSupervisoresSeleccionados}
              trabajadoresSeleccionados={trabajadoresSeleccionados}
              setTrabajadoresSeleccionados={setTrabajadoresSeleccionados}
            />

            {/* Trabajos asociados */}
            <TrabajosPorRealizar
              modoEdicion={modoEdicion}
              mostrarFormulario={false}
              trabajos={trabajos}
              setTrabajos={setTrabajos}
              trabajosProyecto={trabajosProyecto}
              personalAsignado={personalAsignado}
              gastosProyecto={gastosProyecto}
            />

            {/* Botones de acción */}
            <div className="flex justify-end mt-4 gap-2">
              {modoEdicion ? (
                <>
                  <button
                    onClick={() => setModoEdicion(false)}
                    className="bg-gray-300 px-4 py-2 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarCambios}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                  >
                    Guardar cambios
                  </button>
                </>
              ) : (
                <button
                  onClick={async () => {
                    setNuevoProyecto({
                      nombre: proyectoSeleccionado.nombre,
                      descripcion: proyectoSeleccionado.descripcion,
                      categoria_id: proyectoSeleccionado.categoria_id,
                    });
                    await obtenerPersonal(proyectoSeleccionado);
                    setModoEdicion(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md"
                >
                  ✏️ Editar
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
