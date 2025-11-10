// src/config/roles.js
// Define qué pestañas puede ver cada rol del sistema.

export const ALLOWED_BY_ROLE = {
  // 🔹 ADMIN: ve todo el sistema de administración
  admin: [
    "VistaMovimientos",
    "papeleria",
    "personal",
    "servicios",
    "inventario",
    "ventas",
    "proyectos",
    "Liquidez",
    "gestionUsuarios",
  ],

  // 🔹 ROL "ventas": sistema de administración con pestaña Ventas
  ventas: ["ventas", "inventario", "proyectos", "personal"],

  // 🔹 Estos roles usan SOLO el SISTEMA DEL VENDEDOR (azul)
  //     → no necesitan pestañas del admin
  vendedor: [],
  supervisor_ventas: [],
  bodega: [],
};
