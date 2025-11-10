// src/modules/vendedor/ui/pages/Ventas.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Pantalla de Ventas del sistema del vendedor (PLACEHOLDER).
//
// - CAPA: UI (React).
// - BASE DE DATOS: todavía NO conectada. Se conectará a las tablas de ventas
//   (o facturación) para mostrar el historial del vendedor / equipo.
// -----------------------------------------------------------------------------

import React from "react";

export default function Ventas() {
  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90">
      <div className="w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md flex flex-col">
        <div className="px-5 sm:px-6 md:px-8 py-5 border-b border-white/10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            Ventas del Vendedor
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Resumen de las ventas realizadas por el vendedor.
          </p>
        </div>

        <div className="flex-1 overflow-auto p-5 sm:p-6">
          <div className="border border-white/15 rounded-2xl bg-[#020617]/40 p-4 text-white/70 text-sm text-center">
            Placeholder de Ventas. Aquí mostraremos el historial de ventas
            con datos reales desde la base de datos.
          </div>
        </div>
      </div>
    </div>
  );
}
