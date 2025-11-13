// src/config/roles.js
// Define qué pestañas puede ver cada rol del sistema ADMIN (tema blanco).
// Códigos de rol canónicos en minúsculas.

export const ALLOWED_BY_ROLE = {
  // ADMIN ve todo en el sistema administrativo
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

  // Rol "ventas" dentro del sistema ADMIN (si lo usas así)
  ventas: ["ventas", "inventario", "proyectos", "personal"],

  // Estos roles operan principalmente en el sistema del VENDEDOR (azul)
  vendedor: [],            // layout azul; no requieren pestañas del admin
  supervisor_ventas: [],   // layout azul; ver Autorizaciones, etc.

  // Bodega (si quieres darle acceso a inventario del admin)
  bodega: ["inventario"],

  // Roles de contabilidad: generalmente Liquidez / finanzas
  contador: ["Liquidez"],
  auxiliar_contabilidad: ["Liquidez"],
};
