// VerPlanilla.jsx
import React, { useState, useEffect } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import supabase from "../../supabase";
import ModificarTrabajos from "./ModificarTrabajos";
import { guardarLog } from "../../utils";

export default function VerPlanilla({ usuario }) {

  const [mostrarFormularioModificar, setMostrarFormularioModificar] = useState(false);
  const [personal, setPersonal] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [verResumen, setVerResumen] = useState(false);
  const [modoModificar, setModoModificar] = useState(false);
  const [modoReportar, setModoReportar] = useState(false);
  const [asistencia, setAsistencia] = useState("");
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [reportesDiarios, setReportesDiarios] = useState([]);
  const [trabajosProyecto, setTrabajosProyecto] = useState([]);
  const [datosReporte, setDatosReporte] = useState({
    pagoPorDia: "",
    horasExtras: "",
    unidadesMeta: "",
    unidadesBonificacion: "",
    bonificacionExtra: "",
    pagoExtraordinario: "",
    grupo: "",
  });
  const [verErrores, setVerErrores] = useState(false);

  
  const handleInputChange = (e) => {
  setDatosReporte({
    ...datosReporte,
    [e.target.name]: e.target.value,
  });
};

const handleVerResumen = async (p) => {
  if (personaSeleccionada?.id === p.id && verResumen) {
    setVerResumen(false);
    setPersonaSeleccionada(null);
  } else {
    setPersonaSeleccionada(p);
    setVerResumen(true);
    setModoModificar(false);
    setModoReportar(false);
    setAsistencia("");
    setDatosReporte({
      pagoPorDia: "",
      horasExtras: "",
      unidadesMeta: "",
      unidadesBonificacion: "",
      bonificacionExtra: "",
      pagoExtraordinario: "",
      grupo: "",
      trabajoRealizado: "",
    });

    await cargarReportesDiarios(p.nombrecompleto);

    // 🔥 Buscamos el proyecto_id en proyectos_personal
   const { data: proyectos, error } = await supabase
  .from("proyectos_personal")
  .select("proyecto_id")
  .eq("trabajador_id", p.id)
  .limit(1);



    if (error) {
  console.error("Error buscando proyecto:", error);
  return;
}

if (proyectos && proyectos.length > 0) {
  const proyectoId = proyectos[0].proyecto_id;
  console.log("Proyecto encontrado:", proyectoId);
  setProyectoSeleccionado({ id: proyectoId });
  await cargarTrabajosProyecto(proyectoId);
} else {
  alert("Error: No se encontró el proyecto asignado para este trabajador. Verifica la asignación.");
  setTrabajosProyecto([]);
  setProyectoSeleccionado(null);
}
  }
};


const cargarReportesDiarios = async (nombreTrabajador) => {
  const { data: reportes, error } = await supabase
    .from("reportesdiarios")
    .select("*")
    .eq("nombretrabajador", nombreTrabajador);

  if (error) {
    console.error("Error cargando reportes diarios:", error);
    return;
  }

  setReportesDiarios(reportes);
};

// Obtener los trabajos del proyecto asignado a la persona seleccionada
const cargarTrabajosProyecto = async (proyectoId) => {
  if (!proyectoId) {
    setTrabajosProyecto([]);
    return;
  }

  const { data: trabajos, error } = await supabase
    .from("proyectos_trabajos")
    .select("id, nombre_trabajo")
    .eq("proyecto_id", proyectoId);

  if (error) {
    console.error("Error al cargar trabajos:", error);
    return;
  }

  console.log("Trabajos obtenidos:", trabajos); // 👈 Para verlos en consola
  setTrabajosProyecto(trabajos);
};


const cargarPersonal = async () => {
  // 1️⃣ Traer datos generales
  const { data: personalData, error: personalError } = await supabase
    .from("registrodepersonal")
    .select("*");

  if (personalError) {
    console.error("Error cargando personal:", personalError);
    return;
  }

  await guardarLog(usuario, "Vista de Planilla", "El usuario visualizó la planilla de personal.");

  // 2️⃣ Traer suma de pagos totales y viáticos por trabajador
  const { data: reportesData, error: reportesError } = await supabase
    .from("reportesdiarios")
    .select("nombretrabajador, pagototal, viaticos");

  if (reportesError) {
    console.error("Error cargando reportes:", reportesError);
    return;
  }

  // 3️⃣ Acumular pagos y viáticos por persona
  const acumuladosPorPersona = {};
  reportesData.forEach((r) => {
    if (!acumuladosPorPersona[r.nombretrabajador]) {
      acumuladosPorPersona[r.nombretrabajador] = {
        pagos: 0,
        viaticos: 0,
      };
    }
    acumuladosPorPersona[r.nombretrabajador].pagos += parseFloat(r.pagototal || 0);
    acumuladosPorPersona[r.nombretrabajador].viaticos += parseFloat(r.viaticos || 0);
  });

  // 4️⃣ Combinar el total acumulado con el personal
  const personalConTotales = personalData.map((p) => {
    const acumulados = acumuladosPorPersona[p.nombrecompleto] || { pagos: 0, viaticos: 0 };

    let totalAcumulado = 0;
    if (p.modalidad === "fijo") {
      totalAcumulado = (p.salarioporquincena || 0) + acumulados.pagos;
    } else {
      totalAcumulado = acumulados.pagos;
    }

    return {
      ...p,
      totalAcumulado,
      totalViaticos: acumulados.viaticos, // 👈 Nuevo campo con viáticos acumulados
    };
  });

  setPersonal(personalConTotales);
};

  useEffect(() => {
    cargarPersonal();
  }, []);


return (
  <div className="overflow-x-auto bg-white/70 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-xl mt-6">
    <h3 className="text-xl font-bold mb-4 text-gray-800 text-center md:text-left">📋 Planilla de Personal</h3>

    <table className="min-w-full border border-gray-300 text-sm text-center">
      <thead className="bg-gray-200 text-gray-700">
        <tr>
          <th className="px-2 py-2 border"></th>
          <th className="px-2 py-2 border">Nombre</th>
          <th className="px-2 py-2 border">Modalidad</th>
          <th className="px-2 py-2 border">Salario</th>
          <th className="px-2 py-2 border">Bono por día</th>
          <th className="px-2 py-2 border">Hora extra</th>
          <th className="px-2 py-2 border">Viáticos</th>
          <th className="px-2 py-2 border">Total Viáticos</th>
          <th className="px-2 py-2 border font-semibold text-green-800">Total</th>
        </tr>
      </thead>
      <tbody>
        {personal.map((p) => {
          const salario = p.modalidad === "fijo" ? p.salarioporquincena || 0 : p.salariopordia || 0;
          const bono = p.bonificacion || 0;
          const horaExtra = p.pagoporhoraextra || 0;
          const viaticos = p.viaticos_diarios || 0;
          const totalSinViaticos = (p.totalAcumulado || 0) - (p.totalViaticos || 0);

          return (
            <React.Fragment key={p.id}>
              <tr className="border-b">
                <td className="px-2 py-2 border">
                  <button
                    onClick={() => handleVerResumen(p)}
                    className="text-green-600 hover:text-green-800"
                  >
                    {personaSeleccionada?.id === p.id && verResumen ? (
                      <MinusCircle size={20} />
                    ) : (
                      <PlusCircle size={20} />
                    )}
                  </button>
                </td>
                <td className="px-2 py-2 border text-xs md:text-sm">{p.nombrecompleto}</td>
                <td className="px-2 py-2 border capitalize text-xs md:text-sm">{p.modalidad}</td>
                <td className="px-2 py-2 border text-xs md:text-sm">Q{salario.toLocaleString()}</td>
                <td className="px-2 py-2 border text-xs md:text-sm">Q{bono.toLocaleString()}</td>
                <td className="px-2 py-2 border text-xs md:text-sm">Q{horaExtra.toLocaleString()}</td>
                <td className="px-2 py-2 border text-xs md:text-sm">Q{viaticos.toLocaleString()}</td>
                <td className="px-2 py-2 border text-xs md:text-sm text-green-700 font-semibold">
                  Q{(p.totalViaticos || 0).toLocaleString()}
                </td>
                <td className="px-2 py-2 border font-bold text-green-700 text-xs md:text-sm">
                  Q{totalSinViaticos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
            </tr>
            
        {verResumen && personaSeleccionada?.id === p.id && (
          <tr>
            <td colSpan="8" className="px-4 py-2 bg-gray-50">
              <div className="p-4 bg-white rounded-xl shadow">
                <h4 className="font-bold text-gray-800 mb-4 text-center md:text-left">
                  📅 Resumen diario de {p.nombrecompleto}
                </h4>

                {/* Aquí puedes incluir tus botones "Modificar trabajos" y "Reportar día", y otros contenidos */}
                <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
                  <div
                    onClick={() => {
                      setModoModificar(!modoModificar);
                      setModoReportar(false);
                      setMostrarFormularioModificar(!mostrarFormularioModificar); // 👈 Mostramos el formulario
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow cursor-pointer hover:bg-blue-700 transition w-full md:w-40 text-center"
                  >
                    {mostrarFormularioModificar ? "Cerrar modificación" : "Modificar trabajos"}
                  </div>
                  <div
                    onClick={() => {
                      setModoReportar(!modoReportar);
                      setModoModificar(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-2xl shadow cursor-pointer hover:bg-green-700 transition w-full md:w-40 text-center"
                  >
                    Reportar día
                  </div>
                </div>

    {modoReportar && (
      <div className="bg-white p-4 rounded-xl shadow text-center md:text-left">
        <h5 className="font-semibold mb-2">📆 Reportar asistencia</h5>
        <label className="block mb-1 font-medium">¿Se presentó?</label>
        <select
          value={asistencia}
          onChange={(e) => setAsistencia(e.target.value)}
          className="border p-2 rounded mb-2 w-full md:w-40"
        >
          <option value="">Seleccione</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        {asistencia === "si" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Trabajo realizado */}
            <div>
              <label className="block text-sm font-medium mb-1">Trabajo realizado</label>
              <select
                name="trabajoRealizado"
                value={datosReporte.trabajoRealizado || ""}
                onChange={(e) => setDatosReporte({ ...datosReporte, trabajoRealizado: e.target.value })}
                className="border p-2 rounded w-full"
              >
                <option value="">Seleccione un trabajo</option>
                {trabajosProyecto.map((trabajo) => (
  <option key={trabajo.id} value={trabajo.nombre_trabajo}>
    {trabajo.nombre_trabajo}
  </option>
))}

              </select>
            </div>

            {/* Horas extras */}
            <div>
              <label className="block text-sm font-medium mb-1">Horas extras</label>
              <div className="grid grid-cols-3 gap-1">
                <input
                  type="number"
                  name="horasExtras"
                  placeholder="Cantidad"
                  value={datosReporte.horasExtras || ""}
                  onChange={handleInputChange}
                  className="border p-1 rounded text-xs"
                />
                <input
                  type="text"
                  readOnly
                  value={`Q${p.pagoporhoraextra || 0}`}
                  className="border p-1 rounded bg-gray-100 text-xs cursor-not-allowed"
                />
                <input
                  type="text"
                  readOnly
                  value={`Q${(
                    parseFloat(datosReporte.horasExtras || 0) *
                    parseFloat(p.pagoporhoraextra || 0)
                  ).toFixed(2)}`}
                  className="border p-1 rounded bg-green-100 text-green-800 font-bold text-xs"
                />
              </div>
            </div>

            {/* Viáticos */}
            <div>
              <label className="block text-sm font-medium mb-1">Viáticos</label>
              <input
                type="text"
                value={`Q${p.viaticos_diarios || 0}`}
                readOnly
                className="border p-2 rounded bg-gray-100 cursor-not-allowed w-full"
              />
            </div>

            {/* Unidades para meta */}
            <div>
              <label className="block text-sm font-medium mb-1">Unidades para meta</label>
              <input
                type="number"
                name="unidadesMeta"
                placeholder="Unidades para meta"
                value={datosReporte.unidadesMeta}
                onChange={handleInputChange}
                className={`border p-2 rounded w-full ${
                  datosReporte.unidadesMeta === "" && verErrores ? "border-red-500" : ""
                }`}
              />
            </div>

            {/* Unidades para bonificación y pago extraordinario */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Unidades para bonificación</label>
                <input
                  type="number"
                  name="unidadesBonificacion"
                  placeholder="Unidades para bonificación"
                  value={datosReporte.unidadesBonificacion}
                  onChange={handleInputChange}
                  className={`border p-2 rounded w-full ${
                    datosReporte.unidadesBonificacion === "" && verErrores ? "border-red-500" : ""
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pago Extraordinario (domingo)</label>
                <input
                  type="number"
                  name="pagoExtraordinario"
                  placeholder="Q0"
                  value={datosReporte.pagoExtraordinario || ""}
                  onChange={handleInputChange}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            {/* Bonificación extra y Pago de U/Extra */}
            {parseInt(datosReporte.unidadesBonificacion || 0) >
              parseInt(datosReporte.unidadesMeta || 0) && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Bonificación por unidades extras (Q)</label>
                  <input
                    type="number"
                    name="bonificacionExtra"
                    placeholder="Bonificación por unidades extras (Q)"
                    value={datosReporte.bonificacionExtra || ""}
                    onChange={handleInputChange}
                    className={`border p-2 rounded w-full ${
                      datosReporte.bonificacionExtra === "" && verErrores
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pago de U/Extra</label>
                  <input
                    type="text"
                    readOnly
                    value={`Q${(
                      (parseInt(datosReporte.unidadesBonificacion || 0) -
                        parseInt(datosReporte.unidadesMeta || 0)) *
                      parseFloat(datosReporte.bonificacionExtra || 0)
                    ).toFixed(2)}`}
                    className="border p-2 rounded bg-green-100 text-green-800 font-bold w-full"
                  />
                </div>
              </div>
            )}

            {/* Total final */}
            <div className="col-span-1 md:col-span-2 bg-green-100 p-2 rounded text-green-800 font-bold">
              Total: Q
              {(
                parseFloat(p.bonificacion || 0) +
                parseFloat(p.viaticos_diarios || 0) +
                parseFloat(datosReporte.horasExtras || 0) * parseFloat(p.pagoporhoraextra || 0) +
                (parseInt(datosReporte.unidadesBonificacion || 0) -
                  parseInt(datosReporte.unidadesMeta || 0)) *
                  parseFloat(datosReporte.bonificacionExtra || 0) +
                parseFloat(datosReporte.pagoExtraordinario || 0)
              ).toFixed(2)}
            </div>
          </div>
        )}
{asistencia === "no" && (
  <p className="text-red-600 font-semibold mt-2">
    No se registrarán datos adicionales.
  </p>
)}
{/* Botón subir reporte centrado */}
<div className="flex justify-center mt-4">
  <button
    onClick={async () => {
      const campos = ["horasExtras", "unidadesMeta", "unidadesBonificacion", "trabajoRealizado"];
      const faltanCampos = campos.some((campo) => datosReporte[campo] === "");
      if (faltanCampos) {
        if (window.confirm("Faltan datos. Desea guardar solo los datos llenados?")) {
          console.log("Guardando reporte parcial...");
        } else {
          setVerErrores(true);
          return;
        }
      }

      // ✅ Verificar que se haya seleccionado un proyecto antes de guardar
      if (!proyectoSeleccionado || !proyectoSeleccionado.id) {
        alert("Error: No se encontró el proyecto asignado para este trabajador. Verifica la asignación.");
        return;
      }

      // ✅ Validar que se haya seleccionado el trabajo
      if (!datosReporte.trabajoRealizado) {
        alert("Por favor, selecciona el trabajo realizado.");
        return;
      }

      // 🔥 Crear el objeto para guardar el reporte
      const nuevoReporte = {
        fechareporte: new Date().toISOString().slice(0, 10),
        nombretrabajador: personaSeleccionada.nombrecompleto,
        horas_extras: parseFloat(datosReporte.horasExtras || 0),
        bono: parseInt(p.bonificacion || 0, 10) || 0,
        viaticos: parseInt(p.viaticos_diarios || 0, 10) || 0,
        metaestablecida: parseInt(datosReporte.unidadesMeta || 0),
        cantidad: parseInt(datosReporte.unidadesBonificacion || 0),
        extra: parseFloat(datosReporte.bonificacionExtra || 0),
        pagoextraordinario: parseFloat(datosReporte.pagoExtraordinario || 0),
        pagototal:
          parseFloat(p.bonificacion || 0) +
          parseFloat(p.viaticos_diarios || 0) +
          (parseFloat(datosReporte.horasExtras || 0) * parseFloat(p.pagoporhoraextra || 0)) +
          ((parseInt(datosReporte.unidadesBonificacion || 0) - parseInt(datosReporte.unidadesMeta || 0)) *
            parseFloat(datosReporte.bonificacionExtra || 0)) +
          parseFloat(datosReporte.pagoExtraordinario || 0),
        numerogrupo: datosReporte.grupo || "",
        sepresentoatrabajar: asistencia,
        proyecto: proyectoSeleccionado.id,
        trabajorealizado: datosReporte.trabajoRealizado,
      };

      try {
        // 🔥 Insertar el reporte diario
        const { error } = await supabase
          .from("reportesdiarios")
          .insert([nuevoReporte]);

        if (error) throw error;

        alert("¡Reporte guardado correctamente!");
        setModoReportar(false);
        setVerResumen(false);
        cargarPersonal();

        // 🔥 Calcular el salario final para actualizarlo en registrodepersonal
        const salarioCalculado =
          parseFloat(p.bonificacion || 0) +
          parseFloat(p.viaticos_diarios || 0) +
          (parseFloat(datosReporte.horasExtras || 0) * parseFloat(p.pagoporhoraextra || 0)) +
          ((parseInt(datosReporte.unidadesBonificacion || 0) - parseInt(datosReporte.unidadesMeta || 0)) *
            parseFloat(datosReporte.bonificacionExtra || 0)) +
          parseFloat(datosReporte.pagoExtraordinario || 0);

        const salarioFinalEntero = parseInt(salarioCalculado, 10) || 0;

        const { error: updateError } = await supabase
          .from("registrodepersonal")
          .update({
            salariopordia: salarioFinalEntero,
          })
          .eq("id", p.id);

        if (updateError) throw updateError;

        // 🔥 Recargar para ver reflejado el cambio
        cargarPersonal();
      } catch (error) {
        console.error("Error al guardar en la base de datos:", error);
        alert("Error al guardar en la base de datos.");
      }
    }}
    className="bg-green-600 text-white px-4 py-2 rounded-2xl shadow hover:bg-green-700 transition"
  >
    Subir Reporte
  </button>
</div>




</div>
)}
{/* Tabla resumen de reportes diarios */}
{reportesDiarios.length > 0 ? (
  <div className="bg-white p-4 rounded-xl shadow mt-4">
  <h5 className="font-semibold text-gray-700 mb-2">📝 Reportes diarios:</h5>
  <table className="min-w-full text-xs text-center border border-gray-300">
    <thead className="bg-gray-200 text-gray-700">
      <tr>
        <th className="px-2 py-1 border">Fecha</th>
        <th className="px-2 py-1 border">Horas extras (Q)</th>
        <th className="px-2 py-1 border">Unidades establecidas</th>
        <th className="px-2 py-1 border">Unidades hechas</th>
        <th className="px-2 py-1 border">Unidades extras realizadas</th>
        <th className="px-2 py-1 border">Pago Domingo</th>
        <th className="px-2 py-1 border">Viáticos</th>
        <th className="px-2 py-1 border font-semibold text-green-800">Pago Total (Q)</th>
      </tr>
    </thead>
    <tbody>
      {reportesDiarios.map((r, idx) => {
        const horasExtrasPago = (parseFloat(r.horas_extras || 0) * parseFloat(personaSeleccionada?.pagoporhoraextra || 0)).toFixed(2);
        const unidadesExtrasRealizadas = (parseInt(r.cantidad || 0) - parseInt(r.metaestablecida || 0));
        return (
          <tr key={idx}>
            <td className="border px-2 py-1">{r.fechareporte}</td>
            <td className="border px-2 py-1">Q{horasExtrasPago}</td>
            <td className="border px-2 py-1">{r.metaestablecida}</td>
            <td className="border px-2 py-1">{r.cantidad}</td>
            <td className="border px-2 py-1">{unidadesExtrasRealizadas}</td>
            <td className="border px-2 py-1">{r.pagoextraordinario}</td>
            <td className="border px-2 py-1">{r.viaticos}</td>
            <td className="border px-2 py-1 font-bold text-green-700">
              Q{parseFloat(r.pagototal).toFixed(2)}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
        ) : (
          <p className="text-gray-500 text-sm italic mt-2">
            No hay reportes registrados aún.
          </p>
        )}
        {asistencia === "no" && (
          <p className="text-red-600 font-semibold mt-2">
            No se registrarán datos adicionales.
          </p>
        )}
        {mostrarFormularioModificar && (
          <ModificarTrabajos
            persona={personaSeleccionada}
            onCerrar={() => setMostrarFormularioModificar(false)}
          />
        )}
        </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  })}
</tbody>
</table>
</div>
); 
}



