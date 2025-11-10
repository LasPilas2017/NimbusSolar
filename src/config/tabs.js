// src/config/tabs.js
// -----------------------------------------------------------------------------
// Define todas las pestañas disponibles en la aplicación. Cada rol verá un
// subconjunto según ALLOWED_BY_ROLE en roles.js
// -----------------------------------------------------------------------------

export const ALL_TABS = [
  { id: "VistaMovimientos", label: "Movimientos" },
  { id: "ventas", label: "Ventas" },          // 👈 pestaña de ventas del ADMIN
  { id: "inventario", label: "Inventario" },
  { id: "papeleria", label: "Papelería" },
  { id: "proyectos", label: "Proyectos" },
  { id: "servicios", label: "Servicios" },
  { id: "Liquidez", label: "Liquidez" },
  { id: "personal", label: "Personal" },
  { id: "gestionUsuarios", label: "Usuarios" },
];
