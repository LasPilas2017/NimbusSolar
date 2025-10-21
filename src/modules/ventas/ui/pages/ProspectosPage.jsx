// src/modules/ventas/ui/pages/ProspectosPage.jsx
import React from "react";
import { useProspectosCatalog } from "../../presentation/adapters/useProspectosCatalog";
import Diseno from "../components/prospectos/Diseno";

export default function ProspectosPage() {
  const { loading, error, rows } = useProspectosCatalog();

  if (loading) return <div className="p-4 text-gray-500">Cargando prospectos…</div>;
  if (error)   return <div className="p-4 text-red-600">Error: {String(error)}</div>;

  return <Diseno data={rows} />;
}
