import React from "react";
import FilaResumen from "./FilaResumen";

export default function Resumen({
  quincena = null,       // si mandás null => "Sin quincena"
  resumen = null,        // si viene vacío usamos mock
}) {
  // ----- MOCK DATA SOLO PARA VISTA -----
  const mockResumen = [
    { nombre: "Producción", monto: 120000, porcentaje: 100 },
    { nombre: "Gastos",     monto: 45000,  porcentaje: 38  },
    { nombre: "Utilidad",   monto: 75000,  porcentaje: 62  },
  ];
  // -------------------------------------

  const dataResumen = Array.isArray(resumen) && resumen.length ? resumen : mockResumen;

  return (
    <section className="mt-6 space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Resumen — {quincena || "2025"}
        </h2>
      </div>


      {/* Barras de progreso */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-5 space-y-4">
        {dataResumen.map((row, i) => (
          <FilaResumen
            key={i}
            nombre={row.nombre}
            monto={row.monto}
            porcentaje={row.porcentaje}
          />
        ))}
      </div>
    </section>
  );
}
