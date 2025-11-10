// src/modules/ventas/config/permisosPorRol.js
// -----------------------------------------------------------------------------
// Definición de permisos por rol para el módulo de VENTAS
// Cada rol tiene un arreglo con las claves de los módulos que puede ver
// -----------------------------------------------------------------------------

export const PERMISOS_POR_ROL = {
  // Admin y supervisor pueden ver todos los módulos de ventas
  admin:      ["Resultados", "Prospectos", "CRM", "Agentes", "Global", "Listados", "Ventas"],
  supervisor: ["Resultados", "Prospectos", "CRM", "Agentes", "Global", "Listados", "Ventas"],

  // 👇 AQUÍ EL CAMBIO IMPORTANTE: usamos "ventas" porque así viene el rol desde App.jsx
  ventas:   ["Resultados", "Prospectos", "CRM"],

  // Si quieres, puedes dejar también "vendedor" por si en el futuro usas ese nombre
  vendedor: ["Resultados", "Prospectos", "CRM"],

  contador:   ["Resultados", "CRM"],
  invitado:   ["Prospectos"],
};

// Si quieres que otros módulos también accedan a esto:
export const ROLES_DISPONIBLES = Object.keys(PERMISOS_POR_ROL);
