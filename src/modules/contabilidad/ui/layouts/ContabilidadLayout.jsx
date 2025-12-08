// src/modules/contabilidad/ui/layouts/ContabilidadLayout.jsx
// -----------------------------------------------------------------------------
// Layout base del sistema de contabilidad. Define la estructura visual general:
// un sidebar llamado "Directorio Contable" y una zona de contenido donde se
// renderizan las paginas hijas del modulo. Mantiene la separacion de capas
// propia de arquitectura limpia: este archivo solo se encarga de presentacion.
// Se aplica un fondo con imagen y degradado suave para el estilo futurista.
// -----------------------------------------------------------------------------

import React from "react";
import SidebarContabilidad from "../components/SidebarContabilidad";
import fondoContabilidad from "../../../../assets/images/fondoContabilidad.jpg";

export default function ContabilidadLayout({ children }) {
  // El estado de colapso del sidebar lo controla el propio componente de sidebar,
  // pero ajustamos el layout con flex para que el main se adapte a su ancho.
  return (
    <div
      className="min-h-screen flex text-slate-900"
      style={{
        // Degradado ligero para no difuminar demasiado la imagen de fondo
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.55), rgba(229,234,241,0.65)), url(${fondoContabilidad})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Sidebar fijo para el directorio contable */}
      <aside className="flex-shrink-0 transition-all duration-200">
        {/* Componente encargado de pintar el menu por grupos (incluye encabezado interno) */}
        <SidebarContabilidad />
      </aside>

      {/* Contenido principal donde se inyectan las paginas de contabilidad */}
      <main className="flex-1 p-6 overflow-y-auto transition-all duration-200">
        {/* Slot para renderizar las paginas hijas */}
        <div className="bg-white/60 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-white/20 rounded-3xl p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
