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
