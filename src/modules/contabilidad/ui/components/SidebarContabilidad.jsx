// src/modules/contabilidad/ui/components/SidebarContabilidad.jsx
// -----------------------------------------------------------------------------
// Sidebar colapsable estilo SWPanel para contabilidad.
// - Aplica color verde a grupos/items del documento (isFromDocument: true).
// - Mantiene color base para los items agregados (isFromDocument: false).
// - Incluye animaciones con framer-motion y fallback a MemoryRouter.
// - Agrega un botón de Salir en la parte inferior.
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
  Receipt,
  FileSpreadsheet,
  Boxes,
  ClipboardList,
  LayoutGrid,
  ShieldCheck,
  Users,
  LogOut,
  ChevronLeft,
  FolderKanban,
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
  Receipt,
  FileSpreadsheet,
  Boxes,
  ClipboardList,
  LayoutGrid,
  ShieldCheck,
  Users,
  LogOut,
};

// Componente base reutilizable que pinta el menú usando las props de control.
function SidebarBase({ location, onNavigate, onLogout }) {
  // openGroup controla qué grupo está desplegado; string vacía significa todos cerrados.
  const [openGroup, setOpenGroup] = useState("");
  // Estado para contraer/expandir el sidebar; en modo contraído solo se ven iconos.
  const [collapsed, setCollapsed] = useState(false);

  // Obtiene el componente de ícono según el nombre definido en la config.
  const getIconComponent = (iconName) => ICON_MAP[iconName] || LayoutDashboard;

  // Determina si un sub-botón está activo comparando el pathname actual con su path.
  const isActive = (path) => location.pathname.startsWith(path);

  // Determina clases para botones principales según si vienen del documento (verde) o no (estilo base).
  const getGroupClasses = (isFromDocument, isOpen, isCollapsed) => {
    const layout = isCollapsed ? "justify-center px-2" : "justify-between px-3";
    if (isFromDocument) {
      // Verde para grupos definidos en el documento
      return `w-full flex items-center ${layout} py-2 text-sm font-semibold rounded-xl transition border ${
        isOpen
          ? "bg-green-300/90 text-gray-900 border-green-400"
          : "bg-green-200/90 text-gray-900 border-green-300 hover:bg-green-300/90"
      }`;
    }
    // Estilo original del sidebar para grupos fuera del documento
    return `w-full flex items-center ${layout} py-2 text-sm font-semibold rounded-xl transition ${
      isOpen ? "bg-white/80 text-gray-900" : "text-gray-900 hover:bg-white/70"
    }`;
  };

  // Determina clases para sub-botones según si vienen del documento (verde) o no (base).
  const getItemClasses = (isFromDocument, active, isCollapsed) => {
    const layout = isCollapsed ? "justify-center px-2" : "justify-start px-3";
    if (isFromDocument) {
      // Verde para items del documento
      return active
        ? `w-full flex items-center gap-2 ${layout} py-2 rounded-lg text-sm transition bg-green-200 text-gray-900`
        : `w-full flex items-center gap-2 ${layout} py-2 rounded-lg text-sm transition text-gray-800 hover:bg-green-100 hover:text-gray-900 font-semibold`;
    }
    // Estilo base para items nuevos
    return active
      ? `w-full flex items-center gap-2 ${layout} py-2 rounded-lg text-sm transition bg-slate-200 text-gray-900 shadow-sm`
      : `w-full flex items-center gap-2 ${layout} py-2 rounded-lg text-sm transition text-gray-700 hover:bg-slate-100 hover:text-gray-900`;
  };

  return (
    <aside
      className={`hidden sm:flex h-full ${
        collapsed ? "w-20" : "w-72"
      } flex-col bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border-r border-white/40 text-slate-900 rounded-tr-3xl rounded-br-3xl overflow-hidden transition-[width] duration-200`}
    >
      {/* Encabezado del sidebar */}
      <div className="px-4 py-4 border-b border-white/40 bg-white/70 backdrop-blur-lg flex items-center justify-between">
        {!collapsed && <h2 className="text-lg font-semibold text-gray-900">Directorio Contable</h2>}
        <button
          type="button"
          onClick={() => {
            setCollapsed((prev) => !prev);
            setOpenGroup(""); // cerrar grupos al contraer
          }}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-white/80 border border-white/60 text-gray-700 hover:bg-white"
          aria-label="Contraer/Expandir directorio"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Lista de grupos principales */}
      <nav className="p-3 space-y-2 overflow-y-auto">
        {MENU_CONTABILIDAD.map((group) => {
          const Icon = getIconComponent(group.icon);
          const isOpen = group.groupKey === "inicio" ? false : openGroup === group.groupKey;

          return (
            <div
              key={group.groupKey}
              className="rounded-2xl bg-white/50 backdrop-blur-lg border border-white/40 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-colors"
            >
              {/* Botón principal del grupo */}
              <button
                type="button"
                onClick={() => {
                  if (group.groupKey === "inicio") {
                    // Inicio actúa como acceso directo sin desplegable
                    onNavigate("/contabilidad/tablero", group.groupKey);
                    return;
                  }
                  if (collapsed) return; // en modo contraído no se expanden
                  setOpenGroup((prev) => (prev === group.groupKey ? "" : group.groupKey));
                }}
                className={getGroupClasses(group.isFromDocument, isOpen, collapsed)}
              >
                <span className="flex items-center gap-2">
                  {/* Icono siempre visible en escritorio */}
                  <Icon size={18} className="text-gray-900" />
                  {!collapsed && <span className="text-sm">{group.label}</span>}
                </span>
                {group.groupKey !== "inicio" && !collapsed && (
                  <span className="text-xs text-gray-700">{isOpen ? "▾" : "▸"}</span>
                )}
              </button>

              {/* Sub-botones animados con framer-motion (solo para grupos que no sean inicio) */}
              {group.groupKey !== "inicio" && !collapsed && (
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
                        className={getItemClasses(item.isFromDocument, isActive(item.path), collapsed)}
                      >
                        {!collapsed && item.label}
                        {collapsed && <span className="sr-only">{item.label}</span>}
                        {collapsed && <span />}
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

      {/* Botón de salir al fondo del sidebar; usa el handler provisto */}
      <div className="p-3 mt-auto">
        <button
          type="button"
          onClick={onLogout}
          className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "justify-center px-3 gap-2"} py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition shadow-sm`}
        >
          <LogOut size={16} />
          {!collapsed && "Salir"}
        </button>
      </div>
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

  // Botón salir: limpia storage local y redirige al login forzando recarga completa.
  // Si existe lógica global de logout, aquí se puede invocar en lugar de la limpieza manual.
  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("No se pudo limpiar storage:", e);
    }
    window.location.href = "/";
  };

  return <SidebarBase location={location} onNavigate={handleNavigate} onLogout={handleLogout} />;
}

// Variante fallback: envuelve en MemoryRouter para evitar errores si aún no hay Router.
function SidebarWithMemoryRouter() {
  const handleLogout = () => {
    // Fallback sin router: limpia storage y redirige a la raíz
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("No se pudo limpiar storage:", e);
    }
    window.location.href = "/";
  };

  return (
    <MemoryRouter initialEntries={[window.location.pathname || "/contabilidad/tablero"]}>
      <SidebarBase
        location={{ pathname: window.location.pathname || "/contabilidad/tablero" }}
        onNavigate={(path) => window.history.replaceState(null, "", path)}
        onLogout={handleLogout}
      />
    </MemoryRouter>
  );
}

// Exporta la variante adecuada según exista o no contexto de Router.
export default function SidebarContabilidad() {
  const hasRouter = useInRouterContext();
  return hasRouter ? <SidebarWithRouter /> : <SidebarWithMemoryRouter />;
}
