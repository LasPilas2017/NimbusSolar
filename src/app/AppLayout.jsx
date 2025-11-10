// src/app/AppLayout.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Layout general del sistema Nimbus Solar (después del login).
// Contiene:
//   - Sidebar de navegación (administración)
//   - Shell (contenedor del contenido)
//   - Modal de transacciones
// ----------------------------------------------------------------------------- 

// src/app/AppLayout.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "../components/layout/Sidebar";
import { Shell } from "../components/layout/Shell";

export default function AppLayout({
  mostrarBarra,
  tabs,
  activeTab,
  onSelectTab,
  onToggleSidebar,
  onLogout,
  children,
  mostrarTransacciones,
  tipoTransaccion,
  setTipoTransaccion,
}) {
  return (
    <div className="relative min-h-screen h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* === Barra lateral de navegación (ADMIN) === */}
      <Sidebar
        open={mostrarBarra}
        tabs={tabs}
        activeId={activeTab}
        onSelect={onSelectTab}
        onClose={() => onToggleSidebar(false)}
        onOpen={() => onToggleSidebar(true)}
        onLogout={onLogout}
      />

      {/* === Contenedor principal de contenido === */}
      <Shell dimmed={mostrarBarra}>{children}</Shell>

      {/* === Modal de Transacciones (ingresos / egresos) === */}
      <AnimatePresence>
        {mostrarTransacciones && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-5xl shadow-xl relative">
              <button
                onClick={() => setTipoTransaccion("")}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 mt-4">
                <button
                  onClick={() => setTipoTransaccion("ingresos")}
                  className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-xl shadow hover:scale-105 transition ${
                    tipoTransaccion === "ingresos"
                      ? "bg-green-200 font-bold"
                      : "bg-white/80"
                  }`}
                >
                  💰 Ingresos
                </button>

                <button
                  onClick={() => setTipoTransaccion("egresos")}
                  className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-xl shadow hover:scale-105 transition ${
                    tipoTransaccion === "egresos"
                      ? "bg-red-200 font-bold"
                      : "bg-white/80"
                  }`}
                >
                  📤 Egresos
                </button>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                (Contenido de transacciones aquí)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}