import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function ReportarAsistencia({ usuario, onCerrar }) {
  const [datosSupervisor, setDatosSupervisor] = useState(null);
  const [modoEntrada, setModoEntrada] = useState(true); // true = Entrada, false = Salida
  const [guardando, setGuardando] = useState(false);
  const [reporteId, setReporteId] = useState(null);
  const [horasExtras, setHorasExtras] = useState(0);
  const [razonHorasExtras, setRazonHorasExtras] = useState("");
  const [formularioBloqueado, setFormularioBloqueado] = useState(false);

  // ... tu lógica y componentes internos



  useEffect(() => {
    const cargarDatos = async () => {
      const { data: supervisorData, error } = await supabase
        .from("registrodepersonal")
        .select("nombrecompleto, bonificacion, viaticos_diarios")
        .eq("id_usuario", usuario.id);

      if (supervisorData && supervisorData.length > 0) {
        setDatosSupervisor(supervisorData[0]);

        const hoy = new Date().toISOString().slice(0, 10);
        const { data: reportesHoy } = await supabase
          .from("reportesdiarios")
          .select("id, hora_salida")
          .eq("id_usuario", usuario.id)
          .eq("fechareporte", hoy);

        if (reportesHoy && reportesHoy.length > 0) {
          const reporte = reportesHoy[0];
          if (reporte.hora_salida) {
            setFormularioBloqueado(true);
          } else {
            setReporteId(reporte.id);
            setModoEntrada(false);
          }
        }
      } else {
        console.error(error || "No se encontró el supervisor en registrodepersonal");
      }
    };

    cargarDatos();
  }, [usuario]);

  const obtenerUbicacion = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("No disponible");
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            resolve(`Lat: ${latitude}, Lng: ${longitude}`);
          },
          () => {
            resolve("No disponible");
          }
        );
      }
    });
  };

  const handleEntrada = async () => {
    setGuardando(true);
    const ubicacion = await obtenerUbicacion();

    const nuevoReporte = {
      nombretrabajador: datosSupervisor.nombrecompleto,
      bono: datosSupervisor.bonificacion,
      viaticos_diarios: datosSupervisor.viaticos_diarios,
      horas_extras: 0,
      fechareporte: new Date().toISOString().slice(0, 10),
      hora_entrada: new Date().toLocaleTimeString(),
      ubicacion_entrada: ubicacion,
      reportadopor: usuario.usuario,
      id_usuario: usuario.id,
    };

    const { data, error } = await supabase.from("reportesdiarios").insert([nuevoReporte]).select();

    if (!error && data && data.length > 0) {
      alert("Entrada registrada ✅");
      setReporteId(data[0].id);
      setModoEntrada(false);
    } else {
      console.error(error);
      alert("Hubo un error al guardar la entrada");
    }

    setGuardando(false);
  };

  const handleSalida = async () => {
    if (!reporteId) {
      alert("No se encontró el reporte para registrar la salida");
      return;
    }

    // Validar que si hay horas extras, se ingrese la razón
    if (horasExtras > 0 && razonHorasExtras.trim() === "") {
      alert("Por favor, ingresa la razón de las horas extras");
      return;
    }

    setGuardando(true);
    const ubicacion = await obtenerUbicacion();

    const { error } = await supabase
      .from("reportesdiarios")
      .update({
        hora_salida: new Date().toLocaleTimeString(),
        ubicacion_salida: ubicacion,
        horas_extras: horasExtras,
        razon_horas_extras: horasExtras > 0 ? razonHorasExtras : null,
      })
      .eq("id", reporteId);

    if (!error) {
      alert("Salida registrada ✅");
      setModoEntrada(true);
      setReporteId(null);
      setHorasExtras(0);
      setRazonHorasExtras("");
      setFormularioBloqueado(true);
    } else {
      console.error(error);
      alert("Hubo un error al registrar la salida");
    }

    setGuardando(false);
  };

  const cerrarFormulario = () => {
    if (onCerrar) {
      onCerrar();
    }
  };

  // Si el formulario está bloqueado (ya hizo entrada y salida)
  if (formularioBloqueado) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-md mx-auto">
        <h3 className="text-xl font-bold text-purple-800 mb-4">📝 Reportar Asistencia</h3>
        <p className="text-gray-500 mb-4">✅ Asistencia completada hoy. Vuelve mañana.</p>
        <button
          onClick={cerrarFormulario}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold text-purple-800 mb-4">📝 Reportar Asistencia</h3>

      {datosSupervisor ? (
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={datosSupervisor.nombrecompleto}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bono diario</label>
            <input
              type="number"
              value={datosSupervisor.bonificacion}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Viáticos diarios</label>
            <input
              type="number"
              value={datosSupervisor.viaticos_diarios}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>

          {!modoEntrada && (
            <div className="grid gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Horas extras</label>
                <input
                  type="number"
                  value={horasExtras}
                  onChange={(e) => setHorasExtras(Number(e.target.value))}
                  disabled={usuario.rol !== "supervisor"}
                  className="border p-2 rounded w-full"
                />
              </div>

              {horasExtras > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Razón de horas extras</label>
                  <input
                    type="text"
                    value={razonHorasExtras}
                    onChange={(e) => setRazonHorasExtras(e.target.value)}
                    disabled={usuario.rol !== "supervisor"}
                    className="border p-2 rounded w-full"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button
              onClick={modoEntrada ? handleEntrada : handleSalida}
              disabled={guardando}
              className={`flex-1 ${
                modoEntrada ? "bg-green-600" : "bg-red-600"
              } text-white py-2 rounded hover:opacity-90`}
            >
              {guardando
                ? "Guardando..."
                : modoEntrada
                ? "Entrada"
                : "Salida"}
            </button>

            <button
              onClick={cerrarFormulario}
              className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Cargando datos...</p>
      )}
    </div>
  );
}
