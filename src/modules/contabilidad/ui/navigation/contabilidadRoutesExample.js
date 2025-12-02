// src/modules/contabilidad/ui/navigation/contabilidadRoutesExample.js
// -----------------------------------------------------------------------------
// Ejemplo de rutas sugeridas para integrar el modulo de contabilidad en un
// router central (react-router-dom). Este archivo NO se usa directamente, solo
// documenta como conectar el layout y las paginas cuando el rol sea "contador".
// -----------------------------------------------------------------------------

import ContabilidadLayout from "../layouts/ContabilidadLayout";
import TableroContable from "../pages/TableroContable";
import BandejaFacturas from "../pages/BandejaFacturas";
import CuentasPorCobrar from "../pages/CuentasPorCobrar";
import Bancos from "../pages/Bancos";
import EstadosFinancieros from "../pages/EstadosFinancieros";
import ConfiguracionContable from "../pages/ConfiguracionContable";

export const CONTABILIDAD_ROUTES_EXAMPLE = [
  {
    path: "/contabilidad",
    element: (
      <ContabilidadLayout>
        {/* Con un router real se anidarian las rutas hijas aqui */}
      </ContabilidadLayout>
    ),
    children: [
      { path: "tablero", element: <TableroContable /> },
      { path: "facturas", element: <BandejaFacturas /> },
      { path: "cuentas", element: <CuentasPorCobrar /> },
      { path: "bancos", element: <Bancos /> },
      { path: "estados", element: <EstadosFinancieros /> },
      { path: "configuracion", element: <ConfiguracionContable /> },
    ],
  },
];

// Ejemplo de integracion (comentado) en el router principal:
// import { CONTABILIDAD_ROUTES_EXAMPLE } from "src/modules/contabilidad/ui/navigation/contabilidadRoutesExample";
//
// const routes = [
//   ...otrasRutas,
//   ...(userRole === "contador" ? CONTABILIDAD_ROUTES_EXAMPLE : []),
// ];
//
// Esto permitiria que, si el usuario tiene rol "contador", se monten las rutas
// del nuevo sistema de contabilidad comenzando en /contabilidad/tablero.

// -----------------------------------------------------------------------------
// Rutas sugeridas adicionales (COMENTADAS) para los nuevos modulos:
// -----------------------------------------------------------------------------
// const rutasCompras = [
//   { path: "compras/registrar-gasto", element: <ComprasRegistrarGasto /> },
//   { path: "compras/historial-gastos", element: <ComprasHistorialGastos /> },
//   { path: "compras/categorias-gastos", element: <ComprasCategoriasGastos /> },
// ];
//
// const rutasCxp = [
//   { path: "cxp/facturas-por-pagar", element: <CuentasPorPagarFacturas /> },
//   { path: "cxp/facturas-vencidas", element: <CuentasPorPagarVencidas /> },
//   { path: "cxp/pagos-realizados", element: <CuentasPorPagarPagosRealizados /> },
// ];
//
// const rutasActivos = [
//   { path: "activos/listado", element: <ActivosListado /> },
//   { path: "activos/registrar", element: <ActivosRegistrar /> },
//   { path: "activos/depreciacion-mensual", element: <ActivosDepreciacionMensual /> },
//   { path: "activos/bajas", element: <ActivosBajasContables /> },
// ];
//
// const rutasFiscales = [
//   { path: "fiscales/iva", element: <FiscalesIVA /> },
//   { path: "fiscales/retenciones", element: <FiscalesRetenciones /> },
//   { path: "fiscales/isr", element: <FiscalesISR /> },
// ];
//
// const rutasCostos = [
//   { path: "centro-costos/gastos-proyecto", element: <CentroCostosGastosProyecto /> },
//   { path: "centro-costos/listado", element: <CentroCostosListado /> },
// ];
//
// const rutasAuditoria = [
//   { path: "auditoria/bitacora-general", element: <AuditoriaBitacoraGeneral /> },
//   { path: "auditoria/actividad-usuario", element: <AuditoriaActividadUsuario /> },
// ];
//
// const rutasReportesExtras = [
//   { path: "reportes/diario", element: <ReporteDiario /> },
//   { path: "reportes/mayor", element: <ReporteMayor /> },
//   { path: "reportes/balanza", element: <ReporteBalanza /> },
//   { path: "reportes/estado-resultados", element: <ReporteEstadoResultados /> },
//   { path: "reportes/balance-general", element: <ReporteBalanceGeneral /> },
// ];
//
// Ejemplo de montaje dentro de /contabilidad (comentado):
// {
//   path: "/contabilidad",
//   element: <ContabilidadLayout />,
//   children: [
//     ...rutasCompras,
//     ...rutasCxp,
//     ...rutasActivos,
//     ...rutasFiscales,
//     ...rutasCostos,
//     ...rutasAuditoria,
//     ...rutasReportesExtras,
//   ],
// }
