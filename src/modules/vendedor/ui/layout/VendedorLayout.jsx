// src/modules/vendedor/ui/layout/VendedorLayout.jsx
// -----------------------------------------------------------------------------
// SISTEMA DEL VENDEDOR - LAYOUT PRINCIPAL
// -----------------------------------------------------------------------------
// Este archivo es la versión "ordenada" de tu App.js del sistema del vendedor.
// Aquí queda SOLO la parte de layout / navegación (UI).
// Las pantallas reales (RESULTADOS, PROSPECTOS, etc.) viven en
// src/modules/vendedor/ui/pages/...
//
// IMPORTANTE:
// - El CRM se reutiliza desde src/modules/crm/ui/pages/CRMPage.jsx (es único
//   para todo el sistema), pero aquí le podemos pasar props como `theme="vendedor"`
//   para que se adapte al diseño del vendedor si lo deseas.
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import {
  FiMenu,
  FiX,
  FiBarChart2,
  FiUserPlus,
  FiGrid,
  FiHome,
  FiUsers,
  FiUserCheck,
  FiCheckSquare,
  FiFileText,
  FiShoppingCart,
  FiChevronLeft,
} from "react-icons/fi";

// 🔹 Páginas del sistema del vendedor
import RESULTADOS from "../pages/RESULTADOS.jsx";
import PROSPECTOS from "../pages/PROSPECTOS.jsx";
import MisClientes from "../pages/MisClientes.jsx";
import Cotizaciones from "../pages/Cotizaciones.jsx";
import OC from "../pages/OC.jsx";
import Ventas from "../pages/Ventas.jsx";


// 🔹 CRM compartido (un solo CRM para todo el sistema)
import CRMPage from "../../../crm/ui/pages/CRMPage.jsx";

// -----------------------------------------------------------------------------
// PERMISOS POR ROL DENTRO DEL SISTEMA DEL VENDEDOR
// -----------------------------------------------------------------------------
// Ajusta estos nombres de rol a los que usas en tu BD / auth:
//   - "supervisor_ventas"
//   - "vendedor"
//   - (admin lo puedes tratar como supervisor o darle todo)
// -----------------------------------------------------------------------------

const PERMISOS_VENDEDOR_POR_ROL = {
  supervisor_ventas: {
    // pestañas del sidebar
    tabs: [
      "MIS RESUMEN",
      "MIS VENDEDORES",
      "MIS CLIENTES",
      "COTIZACIONES",
      "ÓRDENES DE COMPRA",
      "VENTAS",
    ],
    // vistas del botón flotante
    floatViews: ["resultados", "prospectos", "crm"],
  },

  vendedor: {
    // ejemplo: el vendedor NO ve “MIS VENDEDORES”
    tabs: ["MIS RESUMEN", "MIS CLIENTES", "COTIZACIONES", "VENTAS"],
    floatViews: ["resultados", "prospectos", "crm"],
  },

  // Por si entra un admin directamente aquí, le damos todo
  admin: {
    tabs: [
      "MIS RESUMEN",
      "MIS VENDEDORES",
      "MIS CLIENTES",
      "COTIZACIONES",
      "ÓRDENES DE COMPRA",
      "VENTAS",
    ],
    floatViews: ["resultados", "prospectos", "crm"],
  },
};

const getPermisosForRol = (rolUsuario) => {
  const key = String(rolUsuario || "").toLowerCase();
  return (
    PERMISOS_VENDEDOR_POR_ROL[key] || PERMISOS_VENDEDOR_POR_ROL.vendedor
  );
};

// ⬇️ Layout principal del sistema del vendedor
export default function VendedorLayout({ user, rolUsuario }) {
  const [tab, setTab] = useState("MIS RESUMEN");
  const [abierto, setAbierto] = useState(false); // menú flotante
  const [vista, setVista] = useState(null);
  const [mostrarSidebar, setMostrarSidebar] = useState(true);

  const permisos = getPermisosForRol(rolUsuario);

  const menuLateral = [
    { label: "MIS RESUMEN", icon: <FiHome /> },
    { label: "MIS VENDEDORES", icon: <FiUsers /> },
    { label: "MIS CLIENTES", icon: <FiUserCheck /> },
    { label: "COTIZACIONES", icon: <FiCheckSquare /> },
    { label: "ÓRDENES DE COMPRA", icon: <FiFileText /> },
    { label: "VENTAS", icon: <FiShoppingCart /> },
  ];

  // pestañas visibles según el rol
  const menuVisible = menuLateral.filter((item) =>
    permisos.tabs.includes(item.label)
  );

  // configuración del menú flotante (vistas)
  const botonesFlotantes = [
    { id: "resultados", label: "Resultados", icon: <FiBarChart2 /> },
    { id: "prospectos", label: "Prospectos", icon: <FiUserPlus /> },
    { id: "crm", label: "CRM", icon: <FiGrid /> },
  ];

  const botonesFlotantesVisibles = botonesFlotantes.filter((b) =>
    permisos.floatViews.includes(b.id)
  );

  const mostrarBotonFlotante =
    tab === "MIS RESUMEN" || tab === "MIS VENDEDORES";

  // ---------------------------------------------------------------------------
  // Elegimos qué pantalla mostrar según la pestaña y la "vista" del botón flotante
  // ---------------------------------------------------------------------------
  const renderContenido = () => {
    // pestañas del sidebar
    if (tab === "MIS CLIENTES") return <MisClientes />;
    if (tab === "COTIZACIONES") return <Cotizaciones />;
    if (tab === "ÓRDENES DE COMPRA") return <OC />;
    if (tab === "VENTAS") return <Ventas />;

    // vistas del botón flotante
    if (mostrarBotonFlotante) {
      if (vista === "resultados") return <RESULTADOS />;
      if (vista === "prospectos") return <PROSPECTOS />;

      if (vista === "crm") {
        // 🔹 Usamos el CRM general, indicando que viene desde el sistema del vendedor.
        // Si CRMPage no usa el prop `theme`, no pasa nada, se ignora.
        return (
          <CRMPage
            theme="vendedor"
            origen="sistema-vendedor"
            user={user}
            rolUsuario={rolUsuario}
          />
        );
      }

      return (
        <div className="text-center text-white/70">
          <h1 className="text-2xl font-semibold mb-3">{tab}</h1>
          <p>Usa el botón flotante para abrir Resultados, Prospectos o CRM.</p>
        </div>
      );
    }

    // estado por defecto cuando no aplica botón flotante
    return (
      <div className="text-center text-white/70">
        <h1 className="text-2xl font-semibold mb-3">{tab}</h1>
        <p>Contenido visual de {tab}</p>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen relative bg-gradient-to-b from-[#0b1320] to-[#0b1320]/95">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 blur-3xl opacity-40 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-emerald-400/30" />

      <div className="relative z-10 flex h-full w-full gap-4 p-4 md:p-6 transition-all duration-300">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside
          className={`transition-all duration-500 ease-in-out ${
            mostrarSidebar
              ? "w-[250px] opacity-100"
              : "w-0 opacity-0 pointer-events-none"
          } rounded-3xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden`}
        >
          {/* Encabezado */}
          <div className="px-6 py-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Directorio
              </h2>
              {user && (
                <p className="text-xs text-white/70 mt-1">
                  {user.nombre || user.email} &middot; {rolUsuario}
                </p>
              )}
            </div>
            <button
              onClick={() => setMostrarSidebar(false)}
              className="text-white/70 hover:text-white transition"
              title="Ocultar menú"
            >
              <FiChevronLeft size={20} />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            {menuVisible.map((item, i) => {
              const activo = tab === item.label;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setTab(item.label);
                    setAbierto(false);
                    setVista(null);
                  }}
                  className={[
                    "w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all border border-transparent",
                    activo
                      ? "text-white bg-gradient-to-r from-cyan-400/30 to-blue-500/30 border-white/10 shadow-inner"
                      : "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/10",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-lg",
                      activo ? "text-cyan-300" : "text-cyan-200/80",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Botón Salir (luego lo conectamos a logout real si quieres) */}
          <div className="p-4 border-t border-white/10">
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl
                         text-white font-semibold transition-all
                         border border-white/10
                         bg-gradient-to-r from-rose-500/90 to-red-500/90 hover:from-rose-500 hover:to-red-500"
            >
              <FiX />
              <span>Salir</span>
            </button>
          </div>
        </aside>

        {/* ---------------- CONTENIDO PRINCIPAL ---------------- */}
        <main
          className={`relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] transition-all duration-500 ${
            mostrarSidebar ? "ml-0" : "w-full"
          }`}
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" />
          <div className="h-full p-0">{renderContenido()}</div>

          {/* Botón mostrar sidebar */}
          {!mostrarSidebar && (
            <button
              onClick={() => setMostrarSidebar(true)}
              title="Mostrar menú"
              className="absolute top-1 left-1 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <FiMenu />
            </button>
          )}
        </main>

        {/* ---------------- BOTÓN FLOTANTE ---------------- */}
        {mostrarBotonFlotante && (
          <>
            {abierto && (
              <div className="fixed bottom-28 right-10 flex flex-col items-end space-y-3 z-50">
                {botonesFlotantesVisibles.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => {
                      setVista(btn.id);
                      setAbierto(false);
                    }}
                    className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/15 text-white font-medium border border-white/10 backdrop-blur-md shadow-lg hover:bg-cyan-400/20 transition-colors"
                  >
                    {btn.icon}
                    <span className="text-sm">{btn.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Botón flotante principal */}
            <button
              onClick={() => setAbierto(!abierto)}
              title={abierto ? "Cerrar menú" : "Abrir menú"}
              className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 rounded-full text-2xl text-white border border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] transition-transform duration-300 ${
                abierto
                  ? "bg-gradient-to-br from-rose-500 to-red-600 hover:scale-105"
                  : "bg-gradient-to-br from-cyan-400 to-blue-600 hover:scale-105"
              }`}
            >
              {abierto ? <FiX /> : <FiMenu />}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
