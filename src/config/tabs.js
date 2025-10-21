import React from 'react';
import { FiUsers, FiDollarSign, FiFolder, FiTool, FiRepeat, FiBox } from 'react-icons/fi';

export const ALL_TABS = [
  { id: "VistaMovimientos", label: "Movimientos", icon: <FiRepeat size={24} /> },
  { id: "papeleria",        label: "Papelería",   icon: <FiFolder size={24} /> },
  { id: "personal",         label: "R.R.H.H.",    icon: <FiUsers size={24} /> },
  { id: "servicios",        label: "Servicios",   icon: <FiTool size={24} /> },
  { id: "inventario",       label: "Inventario",  icon: <FiBox size={24} /> },
  { id: "ventas",           label: "Ventas",      icon: <FiDollarSign size={24} /> },
  { id: "proyectos",        label: "Proyectos",   icon: <FiFolder size={24} /> },
  { id: "Liquidez",         label: "Finanzas",    icon: <FiDollarSign size={24} /> },
];
