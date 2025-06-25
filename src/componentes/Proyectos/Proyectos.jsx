import { useState, useEffect } from "react";
import ModalDetalleProyecto from "./ModalDetalleProyecto";
import NuevoProyecto from "./NuevoProyecto";
import { useProyectoActual } from "./hooks/useProyectoActual";

// 🔹 Tarjeta visual de proyecto
function TarjetaProyecto({ proyecto, abrirDetalle }) {
  const montoTotal = proyecto.monto_total || 0;
  const utilidad = proyecto.utilidad || 0;
  const porcentajeUtilidad = montoTotal > 0 ? Math.min((utilidad / montoTotal) * 100, 100) : 0;

  return (
    <div
      onClick={() => abrirDetalle(proyecto.id)}
      className="min-w-full sm:min-w-[260px] max-w-[300px] h-[240px] snap-start bg-white/80 backdrop-blur-md rounded-2xl shadow p-4 flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition border border-black"
    >
      <div className="flex justify-between items-start gap-2">
        <p className="font-bold text-sm truncate">{proyecto.nombre}</p>
        <div className="text-center">
          <p className="text-[11px] text-gray-600">Monto</p>
          <p className="text-green-700 font-semibold text-sm">Q{montoTotal}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-gray-600">Utilidad</p>
          <p className="text-red-700 font-semibold text-sm">Q{utilidad}</p>
        </div>
      </div>
      <div className="relative h-4 rounded-full overflow-hidden bg-green-300 mt-3">
        <div
          className="absolute left-0 top-0 h-full bg-red-600"
          style={{ width: `${porcentajeUtilidad}%` }}
        />
        <div className="absolute inset-0 flex justify-between px-3 text-xs font-semibold text-white">
          <span>{porcentajeUtilidad.toFixed(1)}%</span>
          <span>Utilidad</span>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm line-clamp-2">{proyecto.descripcion}</p>
      </div>
    </div>
  );
}

export default function Proyectos() {
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

  const [vista, setVista] = useState("lista");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", descripcion: "" });
  const [supervisoresSeleccionados, setSupervisoresSeleccionados] = useState([]);
  const [trabajadoresSeleccionados, setTrabajadoresSeleccionados] = useState([]);
  const [trabajosEstado, setTrabajos] = useState([{ nombre: "", unidades: "" }]);

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

  useEffect(() => {
    obtenerProyectos();
    obtenerSupervisores();
    obtenerPersonal();
  }, []);

  const proyectosPorCategoria = proyectos.reduce((acc, proyecto) => {
    const categoria = proyecto.categorias_contables?.nombre?.trim() || "Sin Categoría";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(proyecto);
    return acc;
  }, {});

  const abrirDetalle = async (idProyecto) => {
  const datos = await cargarDatosProyecto(idProyecto);

  if (datos) {
    // Verifica que traiga la categoría contable y demás campos
    setProyectoSeleccionado({
      ...datos,
      categorias_contables: datos.categorias_contables || null, // Asegura que exista
    });

    setNuevoProyecto({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoria_id: datos.categoria_id,
    });

    setModoEdicion(false);
  }
};

console.log("Proyecto seleccionado:", proyectoSeleccionado);


  return (
    <div className="p-4 sm:p-6 bg-white/30 min-h-screen rounded-2xl">
      {/* 🔘 Botones arriba */}
      {vista === "lista" && (
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <button
            onClick={() => setVista("nuevo")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md"
          >
            ➕ Nuevo Proyecto
          </button>
          <button
            onClick={() => alert("Aquí mostrarías los proyectos finalizados")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md"
          >
            📁 Proyectos Finalizados
          </button>
        </div>
      )}

      {/* 📂 Lista de proyectos */}
      {vista === "lista" && (
        <div className="space-y-8">
          {Object.entries(proyectosPorCategoria).map(([categoria, lista]) => (
            <div key={categoria}>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{categoria}</h2>
              <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4">
                <div className="flex gap-4 w-max min-w-full px-2">
                  {lista.map((proyecto) => (
                    <TarjetaProyecto
                      key={proyecto.id}
                      proyecto={proyecto}
                      abrirDetalle={abrirDetalle}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ➕ Vista nuevo proyecto */}
      {vista === "nuevo" && (
        <NuevoProyecto
          onGuardar={() => {
            setVista("lista");
            obtenerProyectos();
          }}
        />
      )}

      {/* 🔍 Modal detalle proyecto */}
      {proyectoSeleccionado && (
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
)}

    </div>
  );
}
