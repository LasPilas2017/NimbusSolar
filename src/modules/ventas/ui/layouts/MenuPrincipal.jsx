import React, {
  useMemo,
  useState,
  Suspense,
  useEffect,
  useRef,
} from "react";
import { Rocket, Layers } from "lucide-react";
import FloatingModuleMenu from "../components/FloatingModuleMenu/FloatingModuleMenu.jsx";

// ✅ Importamos los permisos desde un archivo separado
import { PERMISOS_POR_ROL } from "../config/permisosPorRol.js";

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
        console.error(
          `[Ventas] ${name} no exporta un componente React. Revisa su Index.jsx`
        );
        return { default: Fallback };
      }
      return { default: pick };
    })
  );

/** ✅ Prospectos (ya lo tenías) */
const ModProspectos = safeLazy(
  () => import("../pages/ProspectosPage.jsx"),
  "Prospectos"
);

/** ✅ CRM: cargamos la página del módulo CRM central */
const ModCrm = safeLazy(
  () => import("../../../crm/ui/pages/CRMPage.jsx"),
  "CRM"
);

/** 📦 Módulos disponibles en el menú flotante */
const MODULOS = [
  {
    key: "Prospectos",
    label: "Prospectos",
    icon: Rocket,
    Component: ModProspectos,
  },
  {
    key: "CRM",
    label: "CRM",
    icon: Layers,
    Component: ModCrm,
  },
  // 🔜 Cuando tengas más páginas listas, las agregas aquí:
  // { key: "Resultados", label: "Resultados", icon: BarChart2, Component: ModResultados },
  // { key: "Agentes", label: "Agentes", icon: Users, Component: ModAgentes },
  // { key: "Global", label: "Global", icon: Globe2, Component: ModGlobal },
  // { key: "Listados", label: "Listados", icon: ListChecks, Component: ModListados },
  // { key: "Ventas", label: "Ventas", icon: Briefcase, Component: ModVentas },
];

export default function Menuprincipal({
  rolUsuario = "invitado",
  user = null,
}) {
  // 🔐 Calculamos un rol efectivo y lo normalizamos a minúsculas
  const roleKey = useMemo(
    () => String(rolUsuario || user?.rol || "invitado").toLowerCase(),
    [rolUsuario, user]
  );

  // Filtramos los módulos visibles según el rol
  const modulosVisibles = useMemo(() => {
    const permitidos = PERMISOS_POR_ROL[roleKey] ?? [];
    return MODULOS.filter((m) => permitidos.includes(m.key));
  }, [roleKey]);

  const [activeKey, setActiveKey] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!activeKey && modulosVisibles.length > 0) {
      setActiveKey(modulosVisibles[0].key);
    } else if (
      activeKey &&
      !modulosVisibles.find((m) => m.key === activeKey)
    ) {
      setActiveKey(modulosVisibles[0]?.key ?? null);
    }
  }, [modulosVisibles, activeKey]);

  const ActiveModule =
    modulosVisibles.find((m) => m.key === activeKey)?.Component;

  const floatingItems = useMemo(
    () =>
      modulosVisibles.map((m) => ({
        key: m.key,
        label: m.label,
        icon: m.icon,
      })),
    [modulosVisibles]
  );

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white">
      <Suspense
        fallback={<div className="p-4 text-gray-500">Cargando módulo…</div>}
      >
        {ActiveModule ? (
          <div
            className="
              relative w-full h-full m-0 p-0 flex justify-center items-start bg-white pt-2
            "
          >
            <div className="w-full h-full overflow-hidden">
              <ActiveModule user={user} rolUsuario={roleKey} />
            </div>

            {menuOpen && (
              <div
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
              />
            )}

            <div ref={menuRef} className="absolute bottom-4 right-4 z-50">
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
