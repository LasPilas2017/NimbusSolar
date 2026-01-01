import { useState, useEffect, lazy, Suspense } from "react";
import supabase from "../../supabase";

const AgregarPersonal = lazy(() => import("./AgregarPersonal"));
const VerPlanilla = lazy(() => import("./VerPlanilla"));
const VerPersonal = lazy(() => import("./VerPersonal"));
const ReportarAsistencia = lazy(() => import("./ReportarAsistencia"));
const ModificarTrabajos = lazy(() => import("./ModificarTrabajos"));

export default function Personal({ usuario }) {
  const [vista, setVista] = useState("menu");
  const [ocultandoMenu] = useState(false);
  const [personal, setPersonal] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [recargarTabla, setRecargarTabla] = useState(false);

  // Fallback temporal para pruebas si no viene el usuario desde props
  const usuarioActual = usuario ?? {
    id: 4,
    usuario: "super1",
    rol: "supervisor",
  };

  const obtenerPersonal = async () => {
    let consulta = supabase
      .from("registrodepersonal")
      .select(
        "id,nombrecompleto,modalidad,salariopordia,salarioporquincena,bonificacion,pagoporhoraextra,viaticos_diarios,dpi,telefono,fechadeingreso,urlpapeleria"
      );
    if (usuarioActual?.rol === "temporal") {
      consulta = consulta.eq("modalidad", "temporal");
    }

    const { data, error } = await consulta;
    if (!error) setPersonal(data);
    else console.error(error);
  };

  useEffect(() => {
    if (vista === "ver_personal") {
      obtenerPersonal();
    }
  }, [vista, recargarTabla]);

  const abrirModificar = (persona) => setPersonaSeleccionada(persona);
  const cerrarModificar = () => setPersonaSeleccionada(null);

  const manejarCambioVista = (nuevaVista) => {
    setVista(nuevaVista);
  };

  const tarjetasMenu = [
    {
      titulo: "Ingreso de Personal",
      vista: "formulario",
    },
    {
      titulo: "Planilla",
      vista: "planilla",
    },
    {
      titulo: "Personal de Empresa",
      vista: "ver_personal",
    },
  ];

  return (
    <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {vista === "menu" && !ocultandoMenu && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col gap-6 w-full max-w-4xl items-center">
            {tarjetasMenu.map((t, i) => (
              <button
                key={i}
                onClick={() => manejarCambioVista(t.vista)}
                className="w-full max-w-2xl cursor-pointer bg-gradient-to-r from-slate-100 to-white border border-slate-200 shadow-lg px-8 py-6 text-center rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <h3 className="text-xl font-semibold tracking-wide text-gray-900">{t.titulo}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {vista !== "menu" && (
        <div className="mb-4">
          <button
            onClick={() => setVista("menu")}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Regresar
          </button>
        </div>
      )}

      <Suspense fallback={<div className="text-center py-10">Cargando...</div>}>
        <>
          {vista === "formulario" && (
            <AgregarPersonal onCerrar={() => setVista("menu")} usuario={usuarioActual} />
          )}
          {vista === "planilla" && (
            <VerPlanilla usuario={usuarioActual} onModificar={abrirModificar} />
          )}
          {vista === "ver_personal" && (
            <VerPersonal personal={personal} usuario={usuarioActual} onModificar={abrirModificar} />
          )}
          {vista === "asistencia" && (
            <ReportarAsistencia usuario={usuarioActual} onCerrar={() => setVista("menu")} />
          )}
        </>
      </Suspense>

      {personaSeleccionada && (
        <ModificarTrabajos
          usuario={usuarioActual}
          persona={personaSeleccionada}
          onCerrar={cerrarModificar}
          onRecargar={() => setRecargarTabla(!recargarTabla)}
        />
      )}
    </div>
  );
}
