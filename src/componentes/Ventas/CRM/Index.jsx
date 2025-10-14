import React from "react";
import CRMPrincipal from "./CRMPrincipal";
import CRMPanelGeneral from "./CRMPanelGeneral";
import CRMPanelEtapas from "./CRMPanelEtapas";
import CRMPanelConversion from "./CRMPanelConversion";
import CRMTablaProspectos from "./CRMTablaProspectos";
import FORMTablaProspectos from "./FORMTablaProspectos";
/**
 * Exportaciones nombradas:
 * te permiten cargar piezas sueltas del CRM si algún día las quieres
 * usar directamente (aunque ahora cargamos el módulo completo).
 */
export {
  CRMPrincipal,
  CRMPanelGeneral,
  CRMPanelEtapas,
  CRMPanelConversion,
  CRMTablaProspectos,
};

/**
 * Exportación por defecto:
 * safeLazy busca por defecto o "Index". Aquí devolvemos el dashboard del CRM.
 */
export default function Index({ user, rolUsuario }) {
  return <CRMPrincipal user={user} rolUsuario={rolUsuario} />;
}
