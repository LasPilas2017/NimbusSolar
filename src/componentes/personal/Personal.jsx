import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabase";

// Importación dinámica de componentes
const AgregarPersonal = lazy(() => import("./AgregarPersonal"));
const VerPlanilla = lazy(() => import("./VerPlanilla"));
const VerPersonal = lazy(() => import("./VerPersonal"));
const ReportarAsistencia = lazy(() => import("./ReportarAsistencia"));
const CajaChica = lazy(() => import("../contabilidad/CajaChica"));
const ModificarTrabajos = lazy(() => import("./ModificarTrabajos"));

export default function Personal() {
  const [vista, setVista] = useState("menu");
  const [ocultandoMenu, setOcultandoMenu] = useState(false);
  const [mostrarFormularioCajaChica, setMostrarFormularioCajaChica] = useState(false);
  const [personal, setPersonal] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [recargarTabla, setRecargarTabla] = useState(false);

  // Usuario temporal para pruebas
  const usuario = {
    id: 4,
    usuario: "super1",
    rol: "supervisor",
  };

  const obtenerPersonal = async () => {
    let consulta = supabase.from("registrodepersonal").select("*");
    if (usuario.rol === "temporal") {
      consulta = consulta.eq("modalidad", "temporal");
    }

    const { data, error } = await consulta;
    if (!error) setPersonal(data);
    else console.error(error);
  };

  useEffect(() => {
    obtenerPersonal();
  }, [vista, recargarTabla]);

  const abrirModificar = (persona) => setPersonaSeleccionada(persona);
  const cerrarModificar = () => setPersonaSeleccionada(null);

  const manejarCambioVista = (nuevaVista) => {
    setVista(nuevaVista);
  };

  return (
    <motion.div
      layout
      transition={{ duration: 1.2, ease: "easeInOut", type: "tween" }}
      className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      {/* Vista principal: menú de opciones */}
      {vista === "menu" && !ocultandoMenu && (
  <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
    {/* Columna izquierda: 3 tarjetas en columna */}  
    <div className="flex flex-col gap-6 flex-grow">
      {[
        {
          titulo: "➕ Agregar Personal",
          descripcion: "Formulario para ingresar trabajadores",
          vista: "formulario",
        },
        {
          titulo: "📋 Ver Planilla",
          descripcion: "Visualizar la planilla del personal",
          vista: "planilla",
        },
        {
          titulo: "👤 Ver Personal",
          descripcion: "Listado completo de trabajadores",
          vista: "ver_personal",
        },
      ].map((t, i) => (
        <div
          key={i}
          onClick={() => manejarCambioVista(t.vista)}
          className="relative cursor-pointer rounded-2xl w-full p-6 text-center bg-white/80 backdrop-blur-md overflow-hidden group shadow-xl hover:scale-[1.01] transition-transform duration-300"
        >
          <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-400 via-purple-200 to-slate-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 animate-pulse pointer-events-none z-0"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t.titulo}</h3>
            <p className="text-sm text-gray-600">{t.descripcion}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Acciones rápidas: solo el tamaño que necesita */}
    <div className="relative rounded-2xl bg-white/80 backdrop-blur-md p-6 shadow-xl overflow-hidden group flex flex-col justify-start space-y-4 self-start">
      <div className="absolute -inset-[2px] bg-gradient-to-br from-yellow-300 via-orange-200 to-pink-300 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 animate-pulse pointer-events-none z-0" />
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-center text-gray-800 mb-4">⚡ Acciones rápidas</h3>
        <button
          onClick={() => manejarCambioVista("asistencia")}
          className="w-full border border-black bg-transparent text-black hover:bg-gray-100 font-semibold py-2 rounded-xl transition"
        >
          ✏️ Reportar Asistencia
        </button>
        <button
          onClick={() => {
            setMostrarFormularioCajaChica(true);
            setVista("caja_chica");
          }}
          className="w-full border border-black bg-transparent text-black hover:bg-gray-100 font-semibold py-2 rounded-xl transition"
        >
          💰 Caja Chica
        </button>
      </div>
    </div>
  </div>
)}


      {/* Contenido dinámico con carga diferida */}
      <Suspense fallback={<div className="text-center py-10">Cargando...</div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={vista}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {mostrarFormularioCajaChica && vista === "caja_chica" && (
              <CajaChica
                onCerrar={() => {
                  setMostrarFormularioCajaChica(false);
                  setVista("menu");
                }}
              />
            )}
            {vista === "formulario" && (
             <AgregarPersonal onCerrar={() => setVista("menu")} usuario={usuario} />
            )}
            {vista === "planilla" && (
              <VerPlanilla personal={personal} onModificar={abrirModificar} />
            )}
            {vista === "ver_personal" && (
              <VerPersonal personal={personal} onModificar={abrirModificar} />
            )}
            {vista === "asistencia" && (
              <ReportarAsistencia usuario={usuario} onCerrar={() => setVista("menu")} />
            )}
          </motion.div>
        </AnimatePresence>
      </Suspense>

      {/* Modal para editar persona */}
      {personaSeleccionada && (
        <ModificarTrabajos
          usuario={usuario}
          persona={personaSeleccionada}
          onCerrar={cerrarModificar}
          onRecargar={() => setRecargarTabla(!recargarTabla)}
        />
      )}
    </motion.div>
  );
}
