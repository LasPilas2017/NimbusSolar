// src/componentes/Proyectos/Proyectos.jsx
import { useState, useEffect } from "react";
import NuevoProyecto from "../components/NuevoProyecto";
import VistaDetalleProyecto from "../components/VistaDetalleProyecto"; // <- re-export del ContenedorPrincipal
import CarruselProyectos from "../components/CarruselProyectos";
import { useProyectoActual } from "../hooks/useProyectoActual";
import { FiPlus, FiFolder } from "react-icons/fi";
import Cargando from "../components/Cargando";

export default function Proyectos() {
  const {
    proyectos,
    obtenerProyectos,
    obtenerSupervisores,
    obtenerPersonal,
    cargarDatosProyecto,
  } = useProyectoActual();

  const [vista, setVista] = useState("lista");
  const [cargando, setCargando] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    obtenerProyectos();
    obtenerSupervisores();
    obtenerPersonal();
    }, []);

  // ✅ Blindado por si proyectos viene undefined al principio
  const proyectosPorCategoria = (proyectos || []).reduce((acc, proyecto) => {
    const categoria =
      proyecto?.categorias_contables?.nombre?.trim() || "Sin Categoría";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(proyecto);
    return acc;
  }, {});

  const abrirDetalle = async (idProyecto) => {
    setCargando(true);
    try {
      const datos = await cargarDatosProyecto(idProyecto);
      if (datos) {
        setProyectoSeleccionado(datos);
        setNuevoProyecto({
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          categoria_id: datos.categoria_id,
        });
        setVista("detalle");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white/30 min-h-screen rounded-2xl">
      {/* Botones arriba */}
      {vista === "lista" && (
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <button
            onClick={() => setVista("nuevo")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-none shadow-sm flex items-center gap-2 transition-colors"
          >
            <FiPlus /> Nuevo Proyecto
          </button>

          <button
            onClick={() => alert("Aquí mostrarías los proyectos finalizados")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-none shadow-sm flex items-center gap-2 transition-colors"
          >
            <FiFolder /> Proyectos Finalizados
          </button>
        </div>
      )}

      {cargando && <Cargando />}

      {/* Lista de proyectos por categoría */}
      {vista === "lista" && (
        <div className="space-y-8">
          {Object.entries(proyectosPorCategoria).map(([categoria, lista]) => (
            <CarruselProyectos
              key={categoria}
              categoria={categoria}
              lista={lista}
              abrirDetalle={abrirDetalle}
            />
          ))}
        </div>
      )}

      {/* Formulario nuevo proyecto */}
      {vista === "nuevo" && (
        <NuevoProyecto
          onGuardar={() => {
            setVista("lista");
            obtenerProyectos();
          }}
        />
      )}

      {/* Detalle del proyecto */}
      {vista === "detalle" && proyectoSeleccionado && (
        <VistaDetalleProyecto
          proyecto={proyectoSeleccionado}
          onVolver={() => {
            setProyectoSeleccionado(null);
            setVista("lista");
          }}
        />
      )}
    </div>
  );
}
