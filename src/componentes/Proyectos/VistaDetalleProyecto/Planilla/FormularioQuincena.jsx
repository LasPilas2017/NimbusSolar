import React, { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";

// 🔹 Calcula la fecha de fin con base en la fecha de inicio (día 1 o 16)
function calcularFechaFin(fechaInicio) {
  try {
    const [anio, mes, dia] = fechaInicio.split("-").map(Number);

    if (dia === 1) {
      return `${anio}-${String(mes).padStart(2, "0")}-15`;
    }

    if (dia === 16) {
      const ultimoDia = new Date(anio, mes, 0).getDate();
      return `${anio}-${String(mes).padStart(2, "0")}-${ultimoDia}`;
    }

    return null;
  } catch {
    return null;
  }
}

export default function FormularioQuincena({ index, fechas, setFechas }) {
  // 🔹 Obtenemos si ya hay fecha guardada para esta quincena
  const fechaGuardada = fechas[index] || {};
  const [fechaInicio, setFechaInicio] = useState(fechaGuardada.inicio || "");
  const [fechaFin, setFechaFin] = useState(fechaGuardada.fin || "");
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(!!(fechaGuardada.inicio && fechaGuardada.fin));

  // 🔹 Al cargar, si ya hay fecha guardada, se asegura que se mantenga
  useEffect(() => {
    if (fechaGuardada.inicio && fechaGuardada.fin) {
      setFechaInicio(fechaGuardada.inicio);
      setFechaFin(fechaGuardada.fin);
      setGuardado(true);
    }
  }, [fechaGuardada]);

  // 🔹 Función para guardar la fecha si cumple validaciones
  const manejarGuardar = () => {
    if (!fechaInicio) {
      setError("Selecciona una fecha.");
      return;
    }

    const dia = parseInt(fechaInicio.split("-")[2]);
    if (dia !== 1 && dia !== 16) {
      setError("Solo se permite el día 1 o 16.");
      return;
    }

    const fin = calcularFechaFin(fechaInicio);
    if (!fin) {
      setError("No se pudo calcular la fecha de fin.");
      return;
    }

    const nuevasFechas = [...fechas];
    nuevasFechas[index] = { inicio: fechaInicio, fin };
    setFechas(nuevasFechas);

    setFechaFin(fin);
    setGuardado(true);
    setError("");
  };

  // 🔹 Formato visual para mostrar dd/mm/aaaa
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
  <div className="w-full flex items-center justify-center bg-white/70 rounded-2xl shadow px-4 py-2">
    {!guardado ? (
      <div className="flex items-center gap-2">
        <input
          type="date"
          className="border border-gray-300 rounded-xl px-2 py-1 text-center text-sm shadow-sm"
          value={fechaInicio}
          onChange={(e) => {
            setFechaInicio(e.target.value);
            setError("");
          }}
        />
        <button
          onClick={manejarGuardar}
          className="p-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 shadow-sm"
          title="Guardar"
        >
          <FiSave size={16} />
        </button>
      </div>
    ) : null}

    {error && (
      <p className="text-red-600 text-xs mt-1 text-center w-full">{error}</p>
    )}
  </div>
);

}
