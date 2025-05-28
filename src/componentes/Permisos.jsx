import React from "react";
import { useAuth } from "./AuthContext"; // O como obtengas al usuario
import AdministradorVista from "./Permisosdecadausuario/AdministradorVista";
import SupervisorGeneralVista from "./Permisosdecadausuario/SupervisorGeneralVista";
import SupervisorCampoVista from "./Permisosdecadausuario/SupervisorCampoVista";
import UsuarioContabilidadVista from "./Permisosdecadausuario/UsuarioContabilidadVista";

export default function Permisos() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <div>Cargando...</div>; // O una pantalla de espera
  }

  // Administrador y contabilidad ven TODO
  if (usuario.rol === "administrador" || usuario.rol === "usuario_contabilidad") {
    return <AdministradorVista />;
  }

  if (usuario.rol === "supervisor_general") {
    return <SupervisorGeneralVista />;
  }

  if (usuario.rol === "supervisor_campo") {
    return <SupervisorCampoVista />;
  }

  return <div>No tienes permisos para ver esta sección.</div>;
}
