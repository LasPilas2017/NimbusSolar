import React, { useState } from "react";
import EncabezadoProyecto from "./Resumen/EncabezadoProyecto";
import SelectorQuincenas from "./Resumen/SelectorQuincenas";
import FormularioQuincena from "./Planilla/FormularioQuincena";
import ResumenGeneralProyecto from "./Resumen/ResumenGeneralProyecto";
import TablaTrabajos from "./Resumen/TablaTrabajos";
import { FiArrowLeft } from "react-icons/fi"
import Planilla from "./Planilla/Planilla";
import ProduccionEstiloExcel from "./Produccion/Produccion";

export default function VistaDetalleProyecto({
  proyecto,
  onVolver,
}) {
  const [quincenas, setQuincenas] = useState(["1ra. Quincena"]);
  const [quincenaActiva, setQuincenaActiva] = useState(null);
  const [fechasQuincenas, setFechasQuincenas] = useState([]);
  const [mostrarSubcategorias, setMostrarSubcategorias] = useState(false);
  const [vistaQuincena, setVistaQuincena] = useState("resumen");
  const [cargandoRegreso, setCargandoRegreso] = useState(false);

const manejarRegreso = () => {
  setCargandoRegreso(true); // Activa spinner
  setTimeout(() => {
    onVolver(); // Llama a la función original
    setCargandoRegreso(false);
  }, 1000); // Espera 1 segundo para mostrar el "loading"
};


  const agregarQuincena = () => {
    const ultimaIndex = quincenas.length - 1;
    const ultimaFecha = fechasQuincenas[ultimaIndex];

    if (!ultimaFecha || !ultimaFecha.fin) {
      alert("Debes guardar la quincena actual antes de agregar una nueva.");
      return;
    }

    const finAnterior = new Date(ultimaFecha.fin);
    const diaFin = finAnterior.getDate();
    const mesFin = finAnterior.getMonth();
    const anioFin = finAnterior.getFullYear();
    const ultimoDiaDelMes = new Date(anioFin, mesFin + 1, 0).getDate();

    let nuevoInicio;
    if (diaFin === 15) {
      nuevoInicio = new Date(anioFin, mesFin, 16);
    } else if (diaFin === ultimoDiaDelMes) {
      nuevoInicio = new Date(anioFin, mesFin + 1, 1);
    } else {
      nuevoInicio = new Date(finAnterior);
      nuevoInicio.setDate(nuevoInicio.getDate() + 1);
    }

    const inicioStr = nuevoInicio.toISOString().split("T")[0];

    const calcularFechaFin = (inicio) => {
      const [a, m, d] = inicio.split("-").map(Number);
      if (d === 1) return `${a}-${String(m).padStart(2, "0")}-15`;
      if (d === 16) {
        const ultimo = new Date(a, m, 0).getDate();
        return `${a}-${String(m).padStart(2, "0")}-${ultimo}`;
      }
      return null;
    };

    const finStr = calcularFechaFin(inicioStr);
    const numero = quincenas.length + 1;
    const sufijo = numero === 2 ? "2da. Quincena" : `${numero}ª. Quincena`;

    setQuincenas([...quincenas, sufijo]);
    setFechasQuincenas([
      ...fechasQuincenas,
      { inicio: inicioStr, fin: finStr },
    ]);
    setQuincenaActiva(sufijo);
  };

  // 🔹 Datos simulados
  const resumenGeneral = [
    { nombre: "Utilidad", monto: 8000, porcentaje: 90 },
    { nombre: "Producción", monto: 15000, porcentaje: 70 },
    { nombre: "Gastos", monto: 5000, porcentaje: 60 },
  ];

  const resumenPorQuincena = {
    "1ra. Quincena": [
      { nombre: "Utilidad", monto: 5000, porcentaje: 85 },
      { nombre: "Producción", monto: 10000, porcentaje: 50 },
      { nombre: "Gastos", monto: 3500, porcentaje: 70 },
    ],
    "2da. Quincena": [
      { nombre: "Utilidad", monto: 3000, porcentaje: 60 },
      { nombre: "Producción", monto: 5000, porcentaje: 45 },
      { nombre: "Gastos", monto: 2500, porcentaje: 50 },
    ],
  };

  const subcategoriasGastos = [
    { nombre: "Planilla", monto: 2500, porcentaje: 71 },
    { nombre: "Caja Chica", monto: 1000, porcentaje: 29 },
  ];

  const resumen = quincenaActiva
    ? resumenPorQuincena[quincenaActiva] || []
    : resumenGeneral;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white/70 rounded-3xl shadow-lg relative">
      {/* 🔙 Botón fijo para volver */}
      <div className="absolute top-4 left-4 z-10 hidden sm:block">
          <button
          onClick={manejarRegreso}
          className="text-base px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium flex items-center gap-2 transition rounded-none shadow"
          disabled={cargandoRegreso}
        >
          <FiArrowLeft className="text-xl animate-pulse" />
          {cargandoRegreso ? "Cargando proyectos..." : ""}
        </button>

        </div>
      {/* 🔹 Encabezado del Proyecto */}
      <EncabezadoProyecto
        proyecto={proyecto}
        fechas={fechasQuincenas}
        quincenaActiva={quincenaActiva}
        quincenas={quincenas}
      />
     {/* 🔹 Línea con botón Resumen General y Selector de Quincenas */}
{/* 🔹 Línea con botón Resumen General y Selector de Quincenas */}
<div className="flex justify-center items-center gap-3 mb-4">
  {/* Botón Resumen General */}
  <button
  onClick={() => setQuincenaActiva(null)}
  className={`h-10 px-4 py-2 text-sm font-medium shadow transition flex items-center rounded-none
    ${
      quincenaActiva === null
        ? "bg-blue-900 text-white"
        : "border border-blue-900 text-blue-900 hover:bg-blue-100"
    }`}
>
  Resumen General
</button>


  {/* Selector de Quincenas */}
  <div className="flex items-center gap-2">
    <SelectorQuincenas
      quincenas={quincenas}
      quincenaActiva={quincenaActiva}
      setQuincenaActiva={setQuincenaActiva}
      agregarQuincena={agregarQuincena}
    />
  </div>
</div>



    

            {/* 🔘 Botones de navegación por vista dentro de la quincena */}
          {quincenaActiva && (
            <div className="flex justify-center gap-2 my-4 flex-wrap">
              {["resumen", "producción", "planilla", "caja chica"].map((vista) => (
                <button
                    key={vista}
                    onClick={() => setVistaQuincena(vista)}
                    className={`px-4 py-2 text-sm font-semibold transition shadow rounded-none
                      ${
                        vistaQuincena === vista
                          ? "bg-blue-900 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                  >
                    {vista.charAt(0).toUpperCase() + vista.slice(1)}
                  </button>

              ))}
            </div>
          )}

      {/* 🔹 Formulario SOLO de la quincena activa */}
      
     {quincenaActiva && vistaQuincena === "resumen" && (
  <FormularioQuincena
    quincena={quincenaActiva}
    index={quincenas.indexOf(quincenaActiva)}
    fechas={fechasQuincenas}
    setFechas={setFechasQuincenas}
  />
)}

{vistaQuincena === "planilla" && quincenaActiva && <Planilla />}

      
     {/* 🔹 Resumen (general o por quincena) */}
{vistaQuincena !== "planilla" && (
  <ResumenGeneralProyecto
    resumen={resumen}
    subcategoriasGastos={subcategoriasGastos}
    mostrarSubcategorias={mostrarSubcategorias}
    setMostrarSubcategorias={setMostrarSubcategorias}
    titulo={
      quincenaActiva
        ? `Resumen de ${quincenaActiva}`
        : "Resumen General del Proyecto"
    }
  />
)}


      {/* 🔹 Tabla de trabajos solo en Resumen General */}
      {quincenaActiva === null && <TablaTrabajos />}
    </div>
  );



}
