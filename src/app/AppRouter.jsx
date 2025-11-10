// src/app/AppRouter.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Este componente actúa como el **enrutador interno (router visual)** del sistema Nimbus Solar.
//
// Se encarga de decidir **qué vista o módulo se renderiza** según la pestaña activa (`tab`),
// tomando en cuenta los permisos del usuario.
//
// Es una especie de “mini-router” interno dentro del layout principal,
// que reemplaza al tradicional <Routes /> de React Router, pero de forma más
// controlada y simple.
// -----------------------------------------------------------------------------

import React from "react";

// Layout con el botón flotante global para Ventas (administración)
import VentasLayout from "../modules/ventas/ui/layouts/VentasLayout.jsx";
// 🆕 Sistema del vendedor (CRM con diseño del vendedor)
import VendedorLayout from "../modules/vendedor/ui/layout/VendedorLayout.jsx";
// ✅ Gestión de usuarios (solo admin)
import GestionUsuarios from "../modules/usuarios/ui/pages/GestionUsuarios.jsx";

export default function AppRouter({
  tab,
  canAccess,
  usuario,
  vistaServicio,
  setVistaServicio,
}) {
  switch (tab) {
    case "personal":
      return canAccess("personal") ? (
        <div className="text-center text-xl font-semibold">
          Personal (Próximamente)
        </div>
      ) : null;

    case "Liquidez":
      return canAccess("Liquidez") ? (
        <div className="text-center text-xl font-semibold">
          Contabilidad (Próximamente)
        </div>
      ) : null;

    case "VistaMovimientos":
      return canAccess("VistaMovimientos") ? (
        <div className="text-center text-xl font-semibold">
          Vista de Movimientos (Próximamente)
        </div>
      ) : null;

    case "proyectos":
      return canAccess("proyectos") ? (
        <div className="text-center text-xl font-semibold">
          Proyectos (Próximamente)
        </div>
      ) : null;

    case "servicios":
      return canAccess("servicios") ? (
        <div className="space-y-3 text-center">
          <div className="text-xl font-semibold">Servicios (Próximamente)</div>
          <div className="text-sm text-gray-500">
            Vista actual: <b>{vistaServicio}</b>
          </div>
        </div>
      ) : null;

    // 🆕 Sistema del VENDEDOR (CRM con diseño del vendedor)
    case "vendedor":
      return canAccess("vendedor") ? (
        <VendedorLayout
          user={usuario}
          rolUsuario={usuario ? usuario.rol : "invitado"}
        />
      ) : null;

    // ✅ Ventas: módulo de administración, con su propio layout y botón flotante
    case "ventas":
      return canAccess("ventas") ? (
        <VentasLayout
          user={usuario}
          rolUsuario={usuario ? usuario.rol : "invitado"}
        />
      ) : null;

    case "gestionUsuarios":
      return canAccess("gestionUsuarios") ? <GestionUsuarios /> : null;

    case "inventario":
      return canAccess("inventario") ? (
        <div className="text-center text-xl font-semibold">
          Inventario (Próximamente)
        </div>
      ) : null;

    case "papeleria":
      return canAccess("papeleria") ? (
        <div className="text-center text-xl font-semibold">
          Papelería (Próximamente)
        </div>
      ) : null;

    default:
      return (
        <div className="text-center text-gray-500">
          Selecciona una sección
        </div>
      );
  }
}
