// src/modules/contabilidad/ui/components/SidebarContabilidad.jsx
// -----------------------------------------------------------------------------
// Sidebar colapsable estilo SWPanel para contabilidad.
// - Solo muestra los grupos principales; al hacer clic despliega/cierra items.
// - Usa lucide-react para íconos y framer-motion para animaciones suaves.
// - Incluye fallback a MemoryRouter si el módulo aún no está dentro de un Router.
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  useInRouterContext,
  MemoryRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  ListChecks,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";
import { MENU_CONTABILIDAD } from "../navigation/menuContabilidad";

// Mapa de nombre -> componente de ícono de lucide-react.
const ICON_MAP = {
  LayoutDashboard,
  Inbox,
  ListChecks,
  CreditCard,
  BarChart3,
  Settings,
};

// Componente base reutilizable que pinta el menú usando las props de control.
function SidebarBase({ location, onNavigate }) {
  // openGroup controla qué grupo está desplegado; string vacía significa todos cerrados.
  const [openGroup, setOpenGroup] = useState("");

  // Obtiene el componente de ícono según el nombre definido en la config.
  const getIconComponent = (iconName) => ICON_MAP[iconName] || LayoutDashboard;

  // Determina si un sub-botón está activo comparando el pathname actual con su path.
  const isActive = (path) => location.pathname.startsWith(path);

  // Determina clases para botones principales según si vienen del documento (verde) o no (estilo base).
  const getGroupClasses = (isFromDocument, isOpen) => {
    if (isFromDocument) {
      // Verde para grupos definidos en el documento
      return `w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition border ${
        isOpen ? "bg-green-700 text-white border-green-700" : "bg-green-600 text-white border-green-700 hover:bg-green-700"
      }`;
    }
    // Estilo original del sidebar para grupos fuera del documento
    return `w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition ${
      isOpen ? "bg-white/10 text-white" : "text-slate-200 hover:bg-slate-700/60"
    }`;
  };

  // Determina clases para sub-botones según si vienen del documento (verde) o no (base).
  const getItemClasses = (isFromDocument, active) => {
    if (isFromDocument) {
      // Verde para items del documento
      return active
        ? "w-full text-left px-3 py-2 rounded-lg text-sm transition bg-green-600 text-white"
        : "w-full text-left px-3 py-2 rounded-lg text-sm transition text-green-600 hover:bg-green-50 hover:text-green-700 font-semibold";
    }
    // Estilo base para items nuevos
    return active
      ? "w-full text-left px-3 py-2 rounded-lg text-sm transition bg-slate-900 text-white shadow-sm"
      : "w-full text-left px-3 py-2 rounded-lg text-sm transition text-slate-400 hover:bg-slate-100 hover:text-slate-800";
  };

  return (
    <aside className="h-full bg-slate-950/80 backdrop-blur-xl border-r border-white/10 text-slate-100 flex flex-col">
      {/* Encabezado del sidebar */}
      <div className="px-4 py-4 border-b border-white/10">
        <h2 className="text-lg font-semibold">Directorio Contable</h2>
      </div>

      {/* Lista de grupos principales */}
      <nav className="p-3 space-y-2 overflow-y-auto">
        {MENU_CONTABILIDAD.map((group) => {
          const Icon = getIconComponent(group.icon);
          const isOpen = group.groupKey === "inicio" ? false : openGroup === group.groupKey;

          return (
            <div
              key={group.groupKey}
              className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
            >
              {/* Botón principal del grupo */}
              <button
                type="button"
                onClick={() => {
                  if (group.groupKey === "inicio") {
                    // Inicio actua como acceso directo sin desplegable
                    onNavigate("/contabilidad/tablero", group.groupKey);
                    return;
                  }
                  setOpenGroup((prev) => (prev === group.groupKey ? "" : group.groupKey));
                }}
                className={getGroupClasses(group.isFromDocument, isOpen)}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} className="text-slate-200" />
                  {group.label}
                </span>
                {group.groupKey !== "inicio" && (
                  <span className="text-xs text-slate-300">{isOpen ? "▾" : "▸"}</span>
                )}
              </button>

              {/* Sub-botones animados con framer-motion */}
              {group.groupKey !== "inicio" && (
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`${group.groupKey}-items`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="pl-4 pr-2 pb-2 space-y-1"
                    >
                      {group.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => onNavigate(item.path, group.groupKey)}
                          className={getItemClasses(item.isFromDocument, isActive(item.path))}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

// Variante con Router: usa useLocation/useNavigate para navegar de forma real.
function SidebarWithRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return <SidebarBase location={location} onNavigate={handleNavigate} />;
}

// Variante fallback: envuelve en MemoryRouter para evitar errores si aún no hay Router.
function SidebarWithMemoryRouter() {
  return (
    <MemoryRouter initialEntries={[window.location.pathname || "/contabilidad/tablero"]}>
      <SidebarWithRouter />
    </MemoryRouter>
  );
}

// Exporta la variante adecuada según exista o no contexto de Router.
export default function SidebarContabilidad() {
  const hasRouter = useInRouterContext();
  return hasRouter ? <SidebarWithRouter /> : <SidebarWithMemoryRouter />;
}
