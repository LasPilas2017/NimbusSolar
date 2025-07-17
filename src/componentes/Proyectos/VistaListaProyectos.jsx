// VistaGeneralProyectos.jsx
import { useEffect, useState } from "react";
import CarruselProyectos from "./CarruselProyectos";
import VistaListaProyectos from "./VistaListaProyectos";

export default function VistaGeneralProyectos({
  proyectos,
  supervisoresPorProyecto,
  cargarDatosProyecto,
  obtenerPersonal,
  setModoEdicion,
  setProyectoSeleccionado,
  eliminarProyecto,
  abrirDetalle
}) {
  const [esMovil, setEsMovil] = useState(false);

  useEffect(() => {
    const manejarResize = () => {
      setEsMovil(window.innerWidth <= 768);
    };
    manejarResize();
    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, []);

  const proyectosPorCategoria = proyectos.reduce((acc, proyecto) => {
    const categoria = proyecto.categorias_contables?.nombre?.trim() || "Sin Categoría";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(proyecto);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(proyectosPorCategoria).map(([categoria, lista]) => (
        <div key={categoria} className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{categoria}</h2>

          {esMovil ? (
            <CarruselProyectos
              categoria={categoria}
              lista={lista}
              abrirDetalle={abrirDetalle}
            />
          ) : (
            <VistaListaProyectos
              proyectos={lista}
              supervisoresPorProyecto={supervisoresPorProyecto}
              cargarDatosProyecto={cargarDatosProyecto}
              obtenerPersonal={obtenerPersonal}
              setModoEdicion={setModoEdicion}
              setProyectoSeleccionado={setProyectoSeleccionado}
              eliminarProyecto={eliminarProyecto}
            />
          )}
        </div>
      ))}
    </div>
  );
}
