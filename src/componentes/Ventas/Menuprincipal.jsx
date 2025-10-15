import React, { useMemo, useState, Suspense, useEffect, useRef } from "react";
import { Users, Contact, BarChart3, ListChecks, Rocket, PieChart, Boxes } from "lucide-react";
import FloatingModuleMenu from "./components/FloatingModuleMenu";

/** Lazy robusto que también muestra qué módulo falló */
const safeLazy = (loader, name) =>
  React.lazy(() =>
    loader().then((m) => {
      const pick =
        (typeof m.default === "function" && m.default) ||
        (typeof m.Index === "function" && m.Index) ||
        Object.values(m).find((v) => typeof v === "function");
      if (!pick) {
        const Fallback = () => (
          <div className="p-6 text-red-600">
            Módulo inválido: <b>{name}</b> no exporta un componente React (usa{" "}
            <code>export default function Index()</code>).
          </div>
        );
        console.error(`[Ventas] ${name} no exporta un componente React. Revisa su Index.jsx`);
        return { default: Fallback };
      }
      return { default: pick };
    })
  );

const ModAgentes     = safeLazy(() => import("./Agentes/Index"), "Agentes");
const ModCRM         = safeLazy(() => import("./CRM/Index"), "CRM");
const ModGlobal      = safeLazy(() => import("./Global/Index"), "Global");
const ModListados    = safeLazy(() => import("./Listados/Index"), "Listados");
const ModProspectos  = safeLazy(() => import("./Prospectos/Index"), "Prospectos");
const ModResultados  = safeLazy(() => import("./Resultados/Index"), "Resultados");
const ModVentasSub   = safeLazy(() => import("./VentasSub/Index"), "VentasSub");

const PERMISOS_POR_ROL = {
  admin: ["Agentes","CRM","Global","Listados","Prospectos","Resultados","VentasSub"],
  supervisor: ["CRM","Prospectos","Resultados","Global"],
  vendedor: ["CRM","Prospectos","VentasSub"],
  contador: ["Resultados","Global","Listados"],
  invitado: ["Resultados"],
};

const MODULOS = [
  { key: "Resultados", label: "Resultados", icon: PieChart,  Component: ModResultados },
  { key: "Agentes",    label: "Agentes",    icon: Users,     Component: ModAgentes },
  { key: "CRM",        label: "CRM",        icon: Contact,   Component: ModCRM },
  { key: "Global",     label: "Global",     icon: BarChart3, Component: ModGlobal },
  { key: "Listados",   label: "Listados",   icon: ListChecks,Component: ModListados },
  { key: "Prospectos", label: "Prospectos", icon: Rocket,    Component: ModProspectos },
  { key: "VentasSub",  label: "Ventas",     icon: Boxes,     Component: ModVentasSub },
];

export default function Menuprincipal({ rolUsuario = "invitado", user = null }) {
  const modulosVisibles = useMemo(() => {
    const permitidos = PERMISOS_POR_ROL[rolUsuario] ?? [];
    return MODULOS.filter((m) => permitidos.includes(m.key));
  }, [rolUsuario]);

  const [activeKey, setActiveKey] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Cerrar si se hace clic fuera del menú o del botón
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!activeKey && modulosVisibles.length > 0) {
      const r = modulosVisibles.find(m => m.key === "Resultados");
      setActiveKey(r ? "Resultados" : modulosVisibles[0].key);
    } else if (activeKey && !modulosVisibles.find(m => m.key === activeKey)) {
      const r = modulosVisibles.find(m => m.key === "Resultados");
      setActiveKey(r ? "Resultados" : (modulosVisibles[0]?.key ?? null));
    }
  }, [modulosVisibles, activeKey]);

  const ActiveModule = modulosVisibles.find((m) => m.key === activeKey)?.Component;

  const floatingItems = useMemo(
    () => modulosVisibles.map(m => ({ key: m.key, label: m.label, icon: m.icon })),
    [modulosVisibles]
  );

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white">
      <Suspense fallback={<div className="p-4 text-gray-500">Cargando módulo…</div>}>
        {ActiveModule ? (
          <div
            className="
              relative
              border border-black
              rounded-none
              w-full h-full
              m-0 p-0
              flex
              justify-center items-start
              bg-white
              pt-2
            "
          >
            <div className="w-full h-full overflow-hidden">
              <ActiveModule user={user} rolUsuario={rolUsuario} />
            </div>

            {/* 🔹 Fondo difuminado cuando el menú está abierto */}
            {menuOpen && (
              <div
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
              />
            )}

            {/* 🔹 Menú flotante en esquina inferior derecha */}
            <div
              ref={menuRef}
              className="absolute bottom-4 right-4 z-50"
            >
              <FloatingModuleMenu
                items={floatingItems}
                activeKey={activeKey}
                onSelect={(k) => {
                  setActiveKey(k);
                  setMenuOpen(false);
                }}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 text-gray-500 flex justify-center items-center h-full">
            {modulosVisibles.length === 0
              ? "No hay módulos disponibles para este rol."
              : "Selecciona un módulo para continuar."}
          </div>
        )}
      </Suspense>
    </div>
  );
}
