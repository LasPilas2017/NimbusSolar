import React from "react";
import { useAgentes } from "../../presentation/adapters/useAgentes";
import AgentesTable from "../components/agentes/AgentesTable";

export default function AgentesPage() {
  const { data, loading } = useAgentes();
  if (loading) return <div className="p-4">Cargando agentes…</div>;
  return <AgentesTable items={data} />;
}
