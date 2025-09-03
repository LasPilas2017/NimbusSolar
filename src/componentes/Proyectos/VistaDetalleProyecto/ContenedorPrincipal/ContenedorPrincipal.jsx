// src/componentes/Proyectos/VistaDetalleProyecto/ContenedorPrincipal/ContenedorPrincipal.jsx
import React, { useState } from "react";
import Resumen from "../Resumen/Resumen";
import Produccion from "../Produccion/Produccion";
import Planilla from "../Planilla/Planilla";
import CajaChica from "../CajaChica/CajaChica";
import EncabezadoProyecto from "./EncabezadoProyecto";
import SelectorQuincenas from "./SelectorQuincenas";

const TABS = ["Resumen", "Producción", "Planilla", "Caja Chica"];

export default function ContenedorPrincipal({
  proyecto = {},
  onVolver = () => {},
}) {
  // Tabs
  const [tabActiva, setTabActiva] = useState("Resumen");

  // Quincenas
  const [quincenas, setQuincenas] = useState(["1ra. Quincena"]);
  const [quincenaActiva, setQuincenaActiva] = useState(null); // null => Resumen General
  const [fechasQuincenas, setFechasQuincenas] = useState([]);

  // ===== Lógica para agregar la siguiente quincena =====
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

    setQuincenas((prev) => [...prev, sufijo]);
    setFechasQuincenas((prev) => [...prev, { inicio: inicioStr, fin: finStr }]);
    setQuincenaActiva(sufijo);
  };
  // =====================================================

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-white/70 rounded-3xl shadow-lg">
      {/* Encabezado del proyecto */}
      <EncabezadoProyecto
        proyecto={proyecto}
        fechas={fechasQuincenas}
        quincenaActiva={quincenaActiva}
        quincenas={quincenas}
      />

      {/* Resumen General / Selector de Quincenas */}
      <div className="flex justify-center items-center gap-3 mb-4">
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

        <SelectorQuincenas
          quincenas={quincenas}
          quincenaActiva={quincenaActiva}
          setQuincenaActiva={setQuincenaActiva}
          agregarQuincena={agregarQuincena}
        />
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 my-4 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            className={`px-4 py-2 text-sm font-semibold transition shadow rounded-none
              ${
                tabActiva === tab
                  ? "bg-blue-900 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenido dinámico por tab */}
      <div className="p-4 rounded-2xl bg-white/70 shadow">
        {tabActiva === "Resumen" && (
          <Resumen
            quincenaSeleccionada={quincenaActiva}
            onCambiarQuincena={setQuincenaActiva}
            proyecto={proyecto}
            quincenas={quincenas}
            fechas={fechasQuincenas}
          />
        )}

        {tabActiva === "Producción" && (
          <Produccion quincenaSeleccionada={quincenaActiva} />
        )}

        {tabActiva === "Planilla" && (
          <Planilla
            quincenaSeleccionada={quincenaActiva}
            onCambiarQuincena={setQuincenaActiva}
          />
        )}

        {tabActiva === "Caja Chica" && (
          <CajaChica quincenaSeleccionada={quincenaActiva} />
        )}
      </div>
    </div>
  );
}
