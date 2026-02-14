// src/app/AppRouter.jsx
// -----------------------------------------------------------------------------
// QUE HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Este componente actua como el **enrutador interno (router visual)** del sistema
// Nimbus Solar.
//
// Se encarga de decidir **que vista o modulo se renderiza** segun la pestana
// activa (`tab`), tomando en cuenta los permisos del usuario.
//
// Es una especie de "mini-router" interno dentro del layout principal,
// que reemplaza al tradicional <Routes /> de React Router, pero de forma mas
// controlada y simple.
// -----------------------------------------------------------------------------

import React from "react";

// Layout con el boton flotante global para Ventas (administracion)
import VentasLayout from "../modules/ventas/ui/layouts/VentasLayout.jsx";
// Sistema del vendedor (CRM con diseno del vendedor)
import VendedorLayout from "../modules/vendedor/ui/layout/VendedorLayout.jsx";
// Gestion de usuarios (solo admin)
import GestionUsuarios from "../modules/usuarios/ui/pages/GestionUsuarios.jsx";
// Modulo de personal completo
import Personal from "../modules/Personal/Personal.jsx";
// Inventario
import InventoryPage from "../modules/inventario/ui/InventoryPage.jsx";

export default function AppRouter({
  tab,
  canAccess,
  usuario,
  vistaServicio,
  setVistaServicio,
}) {
  switch (tab) {
    case "personal":
      return canAccess("personal") ? <Personal usuario={usuario} /> : null;

    case "Liquidez":
      return canAccess("Liquidez") ? (
        <div className="text-center text-xl font-semibold">
          Contabilidad (Proximamente)
        </div>
      ) : null;

    case "VistaMovimientos":
      return canAccess("VistaMovimientos") ? (
        <div className="text-center text-xl font-semibold">
          Vista de Movimientos (Proximamente)
        </div>
      ) : null;

    case "proyectos":
      return canAccess("proyectos") ? (
        <div className="text-center text-xl font-semibold">
          Proyectos (Proximamente)
        </div>
      ) : null;

    case "servicios":
      return canAccess("servicios") ? (
        <div className="space-y-3 text-center">
          <div className="text-xl font-semibold">Servicios (Proximamente)</div>
          <div className="text-sm text-gray-500">
            Vista actual: <b>{vistaServicio}</b>
          </div>
        </div>
      ) : null;

    // Sistema del VENDEDOR (CRM con diseno del vendedor)
    case "vendedor":
      return canAccess("vendedor") ? (
        <VendedorLayout
          user={usuario}
          rolUsuario={usuario ? usuario.rol : "invitado"}
        />
      ) : null;

    // Ventas: modulo de administracion, con su propio layout y boton flotante
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
      return canAccess("inventario") ? <InventoryPage /> : null;

    case "papeleria":
      return canAccess("papeleria") ? (
        <div className="text-center text-xl font-semibold">
          Papeleria (Proximamente)
        </div>
      ) : null;

    default:
      return (
        <div className="text-center text-gray-500">
          Selecciona una seccion
        </div>
      );
  }
}
