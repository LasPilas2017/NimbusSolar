// Personal.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

import AgregarPersonal from "./AgregarPersonal";
import VerPlanilla from "./VerPlanilla";
import VerPersonal from "./VerPersonal";
import ReportarAsistencia from "./ReportarAsistencia";
import CajaChica from "../contabilidad/CajaChica";

export default function Personal() {
  const [vista, setVista] = useState("formulario");
  const [mostrarFormularioCajaChica, setMostrarFormularioCajaChica] = useState(false);
  const [personal, setPersonal] = useState([]);
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
    if (!error) {
      setPersonal(data);
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    if (vista === "planilla" || vista === "ver_personal") {
      obtenerPersonal();
    }
  }, [vista]);

  return (
    <div className="mt-6 max-w-7xl mx-auto bg-white/10 backdrop-blur-xl p-6 rounded-2xl">
      {/* Acciones rápidas y navegación */}
      <div className="flex flex-col md:flex-row gap-6 justify-start">
        {/* Acciones rápidas */}
        <div className="bg-white/70 hover:bg-white/90 transition-all duration-200 rounded-2xl shadow-md p-6 flex-1 text-center flex flex-col gap-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">⚡ Acciones rápidas</h3>
          <button
            onClick={() => setVista("asistencia")}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            ✏️ Reportar Asistencia
          </button>
          <button
            onClick={() => setMostrarFormularioCajaChica(!mostrarFormularioCajaChica)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            💰 Caja Chica
          </button>
        </div>

        {/* Navegación de vistas */}
        <div className="flex flex-col sm:flex-row gap-6 flex-1 justify-center items-center">
          <div
            onClick={() => setVista("formulario")}
            className="bg-white/70 hover:bg-white/90 transition-all duration-200 rounded-2xl shadow-md p-6 w-full sm:w-72 cursor-pointer flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">➕ Agregar Personal</h3>
            <p className="text-gray-600 text-sm">Formulario para ingresar trabajadores</p>
          </div>
          <div
            onClick={() => setVista("planilla")}
            className="bg-white/70 hover:bg-white/90 transition-all duration-200 rounded-2xl shadow-md p-6 w-full sm:w-72 cursor-pointer flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">📋 Ver Planilla</h3>
            <p className="text-gray-600 text-sm">Visualizar la planilla del personal</p>
          </div>
          <div
            onClick={() => setVista("ver_personal")}
            className="bg-white/70 hover:bg-white/90 transition-all duration-200 rounded-2xl shadow-md p-6 w-full sm:w-72 cursor-pointer flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">👤 Ver Personal</h3>
            <p className="text-gray-600 text-sm">Listado completo de trabajadores</p>
          </div>
        </div>
      </div>

      {/* Formulario de caja chica */}
     {mostrarFormularioCajaChica && (
          <CajaChica onCerrar={() => {
            setMostrarFormularioCajaChica(false);
            setVista("formulario");
          }} />
        )}

      {/* Vistas dinámicas */}
      <div className="mt-4">
        {vista === "formulario" && <AgregarPersonal />}
        {vista === "planilla" && <VerPlanilla personal={personal} />}
        {vista === "ver_personal" && <VerPersonal personal={personal} />}
        {vista === "asistencia" && (
          <ReportarAsistencia
            usuario={usuario}
            onCerrar={() => setVista("formulario")}
          />
        )}
      </div>
    </div>
  );
}
