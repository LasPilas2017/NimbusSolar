// src/modules/ventas/ui/layouts/VentasLayout.jsx
import React, { useMemo, useState } from "react";
import FloatingModuleMenu from "../components/FloatingModuleMenu/FloatingModuleMenu.jsx";
import { VENTAS_TABS } from "../constants/ventasTabs";
import ResultadosPage from "../pages/ResultadosPage.jsx";
import AgentesPage from "../pages/AgentesPage.jsx";
import CRMPage from "../../../crm"; 
import ProspectosPage from "../pages/ProspectosPage.jsx"; 

// Componente de marcador de posición para vistas futuras
const Placeholder = ({ title }) => (
  <div className="p-6 text-center text-xl font-semibold">
    {title} (Próximamente)
  </div>
);

export default function VentasLayout({ user }) {
  const [vista, setVista] = useState("resultados");
  const menuItems = useMemo(() => VENTAS_TABS, []);

  return (
    <div className="relative w-full h-full">
      {vista === "resultados"  && <ResultadosPage user={user} />}
      {vista === "agentes"     && <AgentesPage />}
      {vista === "crm"         && <CRMPage />}
      {vista === "global"      && <Placeholder title="Global" />}
      {vista === "listados"    && <Placeholder title="Listados" />}
      {vista === "prospectos"  && <ProspectosPage />} {/* ✅ ahora muestra la página real */}
      {vista === "ventassub"   && <Placeholder title="Ventas" />}

      {/* Botón flotante (visible en todas las pestañas de ventas) */}
      <FloatingModuleMenu items={menuItems} onSelect={setVista} />
    </div>
  );
}
