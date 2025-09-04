// src/componentes/Proyectos/VistaDetalleProyecto/Produccion/Produccion.jsx
import React from "react";
import ProduccionEstiloExcel from "./ProduccionEstiloExcel";

export default function Produccion({ rango }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {rango?.inicio && rango?.fin && (
        <div className="mb-4 text-sm text-slate-600">
          Rango de quincena:{" "}
          <strong>
            {new Date(rango.inicio).toLocaleDateString("es-GT")} —{" "}
            {new Date(rango.fin).toLocaleDateString("es-GT")}
          </strong>
        </div>
      )}

      <ProduccionEstiloExcel rango={rango} />
    </div>
  );
}
