// src/config/menuConfig.js
// Nota: usamos códigos de rol en minúsculas: admin, ventas, supervisor_ventas
export const menuItems = [
  {
    label: "Resultados",
    path: "/resultados",
    allowedRoles: ["ventas", "supervisor_ventas", "admin"],
  },
  {
    label: "Prospectos",
    path: "/prospectos",
    allowedRoles: ["ventas", "supervisor_ventas", "admin"],
  },
  {
    label: "CRM",
    path: "/crm",
    allowedRoles: ["ventas", "supervisor_ventas", "admin"],
  },
  {
    label: "Agentes",
    path: "/agentes",
    allowedRoles: ["supervisor_ventas", "admin"],
  },
  {
    label: "Global",
    path: "/global",
    allowedRoles: ["supervisor_ventas", "admin"],
  },
  {
    label: "Listados",
    path: "/listados",
    allowedRoles: ["supervisor_ventas", "admin"],
  },
  {
    label: "Ventas",
    path: "/ventas",
    allowedRoles: ["supervisor_ventas", "admin"],
  },
];

// Sugerencia (donde compares roles):
// const canSee = item.allowedRoles.includes(String(user.rol).toLowerCase());
