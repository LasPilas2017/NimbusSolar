import React, { useState } from "react";
import FilaResumen from "./FilaResumen";
import SubCategoriasQuincena from "./SubCategoriasQuincena";
import TablaTrabajos from "./TablaTrabajos";

export default function Resumen({
  quincena = null,       // si mandás null => "Sin quincena"
  resumen = null,        // si viene vacío usamos mock
  subcategorias = null,  // idem
  trabajos = null,       // idem
}) {
  // ----- MOCK DATA SOLO PARA VISTA -----
  const mockResumen = [
    { nombre: "Producción", monto: 120000, porcentaje: 100 },
    { nombre: "Gastos", monto: 45000, porcentaje: 38 },
    { nombre: "Utilidad", monto: 75000, porcentaje: 62 },
  ];
  const mockSubcats = [
    { nombre: "Planilla", total: 18000 },
    { nombre: "Combustible", total: 12000 },
    { nombre: "Repuestos", total: 8000 },
    { nombre: "Viáticos", total: 3000 },
  ];
  const mockTrabajos = [
    { trabajo: "Instalación de paneles", cantidad: 56, precioUnitario: 120 },
    { trabajo: "Tendido de cable", cantidad: 120, precioUnitario: 35 },
    { trabajo: "Limpieza de maleza", cantidad: 80, precioUnitario: 25 },
  ];
  // -------------------------------------

  const dataResumen = Array.isArray(resumen) && resumen.length ? resumen : mockResumen;
  const dataSub = Array.isArray(subcategorias) && subcategorias.length ? subcategorias : mockSubcats;
  const dataTrab = Array.isArray(trabajos) && trabajos.length ? trabajos : mockTrabajos;

  // Estado del acordeón (solo visual): "Gastos" abierto/cerrado
  const [openKey, setOpenKey] = useState(null);
  const toggle = (key) => setOpenKey((k) => (k === key ? null : key));

  return (
    <section className="mt-6 space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Resumen — {quincena || "2025"}
        </h2>
        </div>

      {/* Barras de progreso (con despliegue bajo "Gastos") */}
      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-5 space-y-4">
        {dataResumen.map((row, i) => {
          const isGastos = row.nombre === "Gastos";
          const isOpen = openKey === "Gastos";

          return (
            <div key={i} className="space-y-3">
              <FilaResumen
                nombre={row.nombre}
                monto={row.monto}
                porcentaje={row.porcentaje}
                onClick={isGastos ? () => toggle("Gastos") : undefined}
                isOpen={isGastos && isOpen}
              />

              {/* Contenido desplegable justo DEBAJO de la fila de Gastos */}
              {isGastos && (
                <div
                  className={[
                    "overflow-hidden rounded-2xl",
                    "transition-all duration-300",
                    isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  ].join(" ")}
                >
                  <div className="bg-white ring-1 ring-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Subcategorías de Gastos
                    </h4>
                    <SubCategoriasQuincena items={dataSub} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* (Opcional) También querés las subcategorías fijas más abajo: comenta si ya no las querés duplicadas */}
      {/* <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Subcategorías de Gastos</h3>
        <SubCategoriasQuincena items={dataSub} />
      </div> */}

      {/* Trabajos */}
      {dataTrab.length > 0 && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Trabajos a Realizar</h3>
          <TablaTrabajos filas={dataTrab} />
        </div>
      )}
    </section>
  );
}
