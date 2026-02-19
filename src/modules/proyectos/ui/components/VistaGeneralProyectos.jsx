import { useEffect, useState } from "react";
import CarruselProyectos from "./CarruselProyectos";
import VistaListaProyectos from "./VistaListaProyectos";

export default function VistaGeneralProyectos({
  categoria,
  proyectos,
  abrirDetalle,
  supervisoresPorProyecto,
  cargarDatosProyecto,
  obtenerPersonal,
  setModoEdicion,
  setProyectoSeleccionado,
  eliminarProyecto,
}) {
  const [modoMovil, setModoMovil] = useState(false);

  useEffect(() => {
    const verificarPantalla = () => {
      setModoMovil(window.innerWidth <= 768);
    };

    verificarPantalla(); // Verifica al iniciar

    window.addEventListener("resize", verificarPantalla);
    return () => window.removeEventListener("resize", verificarPantalla);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">{categoria}</h2>

      {modoMovil ? (
        <CarruselProyectos
          categoria={categoria}
          lista={proyectos}
          abrirDetalle={abrirDetalle}
        />
      ) : (
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
    </div>
  );
}
