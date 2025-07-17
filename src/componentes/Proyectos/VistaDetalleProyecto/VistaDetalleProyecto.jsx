import React, { useState } from "react";
import EncabezadoProyecto from "./EncabezadoProyecto";
import SelectorQuincenas from "./SelectorQuincenas";
import FormularioQuincena from "./FormularioQuincena";
import ResumenGeneralProyecto from "./ResumenGeneralProyecto";
import TablaTrabajos from "./TablaTrabajos";
import { FiArrowLeft } from "react-icons/fi"

export default function VistaDetalleProyecto({
  proyecto,
  onVolver,
}) {
  const [quincenas, setQuincenas] = useState(["1ra. Quincena"]);
  const [quincenaActiva, setQuincenaActiva] = useState(null);
  const [fechasQuincenas, setFechasQuincenas] = useState([]);
  const [mostrarSubcategorias, setMostrarSubcategorias] = useState(false);

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
            className="text-base px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md font-medium flex items-center gap-2 transition disabled:opacity-50"
            disabled={cargandoRegreso}
          >
            <FiArrowLeft className="text-xl animate-pulse" />
            {cargandoRegreso ? "Cargando proyectos..." : "Regresar"}
          </button>

        </div>
      {/* 🔹 Encabezado del Proyecto */}
      <EncabezadoProyecto
        proyecto={proyecto}
        fechas={fechasQuincenas}
        quincenaActiva={quincenaActiva}
        quincenas={quincenas}
      />
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setQuincenaActiva(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium shadow transition-colors ${
            quincenaActiva === null
              ? "bg-blue-900 text-white"
              : "border-blue-900 text-blue-900 hover:bg-blue-100"
          }`}
        >
          Resumen General
        </button>
      </div>
      {/* 🔹 Selector de Quincenas */}
      <SelectorQuincenas
        quincenas={quincenas}
        quincenaActiva={quincenaActiva}
        setQuincenaActiva={setQuincenaActiva}
        agregarQuincena={agregarQuincena}
      />

      {/* 🔹 Formulario SOLO de la quincena activa */}
      {quincenaActiva && (
        <FormularioQuincena
          quincena={quincenaActiva}
          index={quincenas.indexOf(quincenaActiva)}
          fechas={fechasQuincenas}
          setFechas={setFechasQuincenas}
        />
      )}

      {/* 🔹 Resumen (general o por quincena) */}
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

      {/* 🔹 Tabla de trabajos solo en Resumen General */}
      {quincenaActiva === null && <TablaTrabajos />}
    </div>
  );
}
