// src/modules/ventas/ui/constants/ventasTabs.js
import {
  FiBarChart2, FiUsers, FiGrid, FiGlobe, FiList, FiUserPlus, FiDollarSign
} from "react-icons/fi";

export const VENTAS_TABS = [
  { id: "resultados", label: "Resultados", icon: <FiBarChart2 /> },
  { id: "agentes",    label: "Agentes",    icon: <FiUsers /> },
  { id: "crm",        label: "CRM",        icon: <FiGrid /> },
  { id: "global",     label: "Global",     icon: <FiGlobe /> },
  { id: "listados",   label: "Listados",   icon: <FiList /> },
  { id: "prospectos", label: "Prospectos", icon: <FiUserPlus /> },
  { id: "ventassub",  label: "Ventas",     icon: <FiDollarSign /> },
];
