// src/modules/contabilidad/ui/layouts/ContabilidadLayout.jsx
// -----------------------------------------------------------------------------
// Layout base del sistema de contabilidad. Define la estructura visual general:
// un sidebar llamado "Directorio Contable" y una zona de contenido donde se
// renderizan las paginas hijas del modulo. Mantiene la separacion de capas
// propia de arquitectura limpia: este archivo solo se encarga de presentacion.
// -----------------------------------------------------------------------------

import React from "react";
import SidebarContabilidad from "../components/SidebarContabilidad";

export default function ContabilidadLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar fijo para el directorio contable */}
      <aside className="w-72 bg-white border-r border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200">
          <h1 className="text-xl font-semibold">Directorio Contable</h1>
          <p className="text-xs text-slate-500">
            Navega las vistas contables desde este menu.
          </p>
        </div>
        {/* Componente encargado de pintar el menu por grupos */}
        <SidebarContabilidad />
      </aside>

      {/* Contenido principal donde se inyectan las paginas de contabilidad */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Espacio reservado para breadcrumbs o barra superior adicional */}
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            Aqui puedes agregar filtros, breadcrumbs o acciones rapidas.
          </p>
        </div>

        {/* Slot para renderizar las paginas hijas */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
