// src/config/menuConfig.js
export const menuItems = [
  {
    label: "Resultados",
    path: "/resultados",
    allowedRoles: ["VENDEDOR", "SUPERVISOR", "ADMIN"],
  },
  {
    label: "Prospectos",
    path: "/prospectos",
    allowedRoles: ["VENDEDOR", "SUPERVISOR", "ADMIN"],
  },
  {
    label: "CRM",
    path: "/crm",
    allowedRoles: ["VENDEDOR", "SUPERVISOR", "ADMIN"],
  },
  {
    label: "Agentes",
    path: "/agentes",
    allowedRoles: ["SUPERVISOR", "ADMIN"],
  },
  {
    label: "Global",
    path: "/global",
    allowedRoles: ["SUPERVISOR", "ADMIN"],
  },
  {
    label: "Listados",
    path: "/listados",
    allowedRoles: ["SUPERVISOR", "ADMIN"],
  },
  {
    label: "Ventas",
    path: "/ventas",
    allowedRoles: ["SUPERVISOR", "ADMIN"],
  },
];
