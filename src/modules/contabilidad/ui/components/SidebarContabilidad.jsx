// src/modules/contabilidad/ui/components/SidebarContabilidad.jsx
// -----------------------------------------------------------------------------
// Sidebar que consume la configuracion del menu contable y la pinta en grupos.
// No implementa navegacion real; solo muestra donde se integraria react-router
// mediante <Link> o useNavigate(path). Mantiene la capa de presentacion limpia.
// -----------------------------------------------------------------------------

import React from "react";
import { MENU_CONTABILIDAD } from "../navigation/menuContabilidad";

export default function SidebarContabilidad() {
  return (
    <nav className="p-3 space-y-4">
      {MENU_CONTABILIDAD.map((group) => (
        <div key={group.groupLabel} className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400 px-2">
            {group.groupLabel}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => (
              <button
                key={item.key}
                type="button"
                className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 transition text-sm flex items-center gap-2"
              >
                <span className="text-xs uppercase text-slate-400">{item.icon}</span>
                <span className="font-medium text-slate-800">{item.label}</span>
                {/* Integracion futura:
                    - Reemplazar <button> por <Link to={item.path}> si usas react-router-dom.
                    - O usar useNavigate(item.path) en el onClick.
                */}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
