import { useState, useEffect } from "react";
import VistaListaProyectos from "./VistaListaProyectos";
import ModalDetalleProyecto from "./ModalDetalleProyecto";
import NuevoProyecto from "./NuevoProyecto";
import { useProyectoActual } from "./hooks/useProyectoActual";

export default function Proyectos() {
  // 🔹 Hook que gestiona toda la lógica del proyecto
  const {
    proyectos,
    trabajos,
    trabajosProyecto,
    personalDisponible,
    personalAsignado,
    gastosProyecto,
    supervisoresPorProyecto,
    obtenerProyectos,
    obtenerSupervisores,
    obtenerPersonal,
    cargarDatosProyecto,
    eliminarProyecto,
  } = useProyectoActual();

  // 🔹 Estados locales del componente
  const [vista, setVista] = useState("lista");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", descripcion: "" });
  const [supervisoresSeleccionados, setSupervisoresSeleccionados] = useState([]);
  const [trabajadoresSeleccionados, setTrabajadoresSeleccionados] = useState([]);
  const [trabajosEstado, setTrabajos] = useState([{ nombre: "", unidades: "" }]);

  // 🔄 Cuando se activa el modo edición, copiar trabajos existentes al estado editable
useEffect(() => {
  if (modoEdicion && trabajosProyecto?.length) {
    const trabajosCopia = trabajosProyecto.map((t) => ({
      id: t.id,
      nombre: t.nombre ?? t.nombre_trabajo,
      unidades: t.unidades ?? t.unidades_totales,
      instaladas: t.instaladas ?? 0,
    }));
    setTrabajos(trabajosCopia);
  }
}, [modoEdicion, trabajosProyecto]);

  // 🔹 Cargar todos los proyectos y personal al iniciar
  useEffect(() => {
    obtenerProyectos();
    obtenerSupervisores();
    obtenerPersonal();
  }, []);

  return (
    <div className="p-6 bg-white/30 min-h-screen rounded-2xl">
      {/* 🔸 Botón para registrar un nuevo proyecto */}
      {vista === "lista" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setVista("nuevo")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md"
          >
            ➕ Nuevo Proyecto
          </button>
        </div>
      )}

      {/* 🔸 Vista de listado de proyectos */}
      {vista === "lista" && (
        <VistaListaProyectos
          proyectos={proyectos}
          supervisoresPorProyecto={supervisoresPorProyecto}
          cargarDatosProyecto={cargarDatosProyecto}
          obtenerPersonal={obtenerPersonal}
          setModoEdicion={setModoEdicion}
          setProyectoSeleccionado={setProyectoSeleccionado}
          eliminarProyecto={eliminarProyecto}
        />
      )}

      {/* 🔸 Vista para crear un nuevo proyecto */}
      {vista === "nuevo" && (
        <NuevoProyecto
          onGuardar={() => {
            setVista("lista");
            obtenerProyectos();
          }}
        />
      )}

      {/* 🔸 Modal para ver o editar proyecto seleccionado */}
<ModalDetalleProyecto
  modoEdicion={modoEdicion}
  setModoEdicion={setModoEdicion}
  proyectoSeleccionado={proyectoSeleccionado}
  setProyectoSeleccionado={setProyectoSeleccionado}
  nuevoProyecto={nuevoProyecto}
  setNuevoProyecto={setNuevoProyecto}
  personalDisponible={personalDisponible}
  supervisoresSeleccionados={supervisoresSeleccionados}
  setSupervisoresSeleccionados={setSupervisoresSeleccionados}
  trabajadoresSeleccionados={trabajadoresSeleccionados}
  setTrabajadoresSeleccionados={setTrabajadoresSeleccionados}
  trabajos={trabajosEstado}
  setTrabajos={setTrabajos}
  trabajosProyecto={trabajosProyecto}
  personalAsignado={personalAsignado}
  gastosProyecto={gastosProyecto}
  obtenerProyectos={obtenerProyectos}
  obtenerPersonal={obtenerPersonal}
/>


    </div>
  );
}
