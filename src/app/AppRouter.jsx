// src/app/AppRouter.jsx
import React from 'react';

// Layout con el botón flotante global para Ventas
import VentasLayout from "../modules/ventas/ui/layouts/VentasLayout.jsx";

export default function AppRouter({
  tab,
  canAccess,
  usuario,
  vistaServicio,
  setVistaServicio,
}) {
  switch (tab) {
    case 'personal':
      return canAccess('personal')
        ? <div className="text-center text-xl font-semibold">Personal (Próximamente)</div>
        : null;

    case 'Liquidez':
      return canAccess('Liquidez')
        ? <div className="text-center text-xl font-semibold">Contabilidad (Próximamente)</div>
        : null;

    case 'VistaMovimientos':
      return canAccess('VistaMovimientos')
        ? <div className="text-center text-xl font-semibold">Vista de Movimientos (Próximamente)</div>
        : null;

    case 'proyectos':
      return canAccess('proyectos')
        ? <div className="text-center text-xl font-semibold">Proyectos (Próximamente)</div>
        : null;

    case 'servicios':
      return canAccess('servicios')
        ? (
          <div className="space-y-3 text-center">
            <div className="text-xl font-semibold">Servicios (Próximamente)</div>
            <div className="text-sm text-gray-500">
              Vista actual: <b>{vistaServicio}</b>
            </div>
          </div>
        )
        : null;

    // ✅ Ventas: el layout maneja sub-vistas internas (incluye botón flotante)
    case 'ventas':
      return canAccess('ventas')
        ? <VentasLayout user={usuario} />
        : null;

    case 'inventario':
      return canAccess('inventario')
        ? <div className="text-center text-xl font-semibold">Inventario (Próximamente)</div>
        : null;

    case 'papeleria':
      return canAccess('papeleria')
        ? <div className="text-center text-xl font-semibold">Papelería (Próximamente)</div>
        : null;

    default:
      return <div className="text-center text-gray-500">Selecciona una sección</div>;
  }
}
