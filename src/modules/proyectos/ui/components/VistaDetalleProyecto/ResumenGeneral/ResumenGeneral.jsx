import React, { useMemo } from "react";
import FilaResumenGeneral from "./FilaResumenGeneral";
import TablaTrabajosGeneral from "./TablaTrabajosGeneral";
import ProgresoProyecto from "./ProgresoProyecto";

export default function ResumenGeneral({
  quincena = null,
  resumen = null,   // [{ nombre, monto, porcentaje? }]
  trabajos = null,  // [{ trabajo, cantidad, precioUnitario }]
  avanceProyecto,   // ← % global opcional (si no viene, usamos fallback)
}) {
  // Mock
  const mockResumen = [
    { nombre: "Producción", monto: 100115, porcentaje: 100 },
    { nombre: "Gastos",     monto: 45000,  porcentaje: 45  },
    { nombre: "Utilidad",   monto: 75000,  porcentaje: 75  },
  ];
  const mockTrabajos = [
    { trabajo: "Instalación de paneles", cantidad: 56,  precioUnitario: 120 },
    { trabajo: "Tendido de cable",       cantidad: 120, precioUnitario: 35  },
    { trabajo: "Limpieza de maleza",     cantidad: 80,  precioUnitario: 25  },
  ];

  const dataResumen = Array.isArray(resumen) && resumen.length ? resumen : mockResumen;
  const dataTrab = Array.isArray(trabajos) && trabajos.length ? trabajos : mockTrabajos;

  // % global del proyecto (elige tu regla real).
  // Si no te pasan 'avanceProyecto', usamos el promedio simple de los % mostrados (fallback).
  const progresoGlobal = useMemo(() => {
    if (typeof avanceProyecto === "number") return Math.max(0, Math.min(100, avanceProyecto));
    const porcentajes = dataResumen.map(r => Number(r.porcentaje || 0));
    const validos = porcentajes.filter(p => !Number.isNaN(p));
    if (!validos.length) return 0;
    return Math.round(validos.reduce((a, b) => a + b, 0) / validos.length);
  }, [avanceProyecto, dataResumen]);

  return (
    <section className="mt-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Resumen — {quincena || "2025"}
        </h2>
        </div>


      {/* Tarjeta: barras + círculo grande al lado */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-5">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          {/* Barras a la izquierda */}
          <div className="space-y-4">
            {dataResumen.map((row, i) => (
              <FilaResumenGeneral
                key={i}
                nombre={row.nombre}
                monto={row.monto}
                porcentaje={row.porcentaje ?? 0}
              />
            ))}
          </div>

          {/* Círculo grande a la derecha */}
          <div className="justify-self-center md:justify-self-end">
            <ProgresoProyecto porcentaje={progresoGlobal} size={200} stroke={16} />
          </div>
        </div>
      </div>

      {/* Tabla de trabajos */}
      {dataTrab.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Trabajos a Realizar
          </h3>
          <TablaTrabajosGeneral filas={dataTrab} />
        </div>
      )}
    </section>
  );
}
