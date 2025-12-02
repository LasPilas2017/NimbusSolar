// src/modules/contabilidad/ui/navigation/menuContabilidad.js
// -----------------------------------------------------------------------------
// Configuracion del menu lateral del modulo de contabilidad. Cada item incluye
// etiqueta, clave unica, ruta sugerida e icono (string). Para agregar nuevos
// items solo hay que sumar un objeto en el grupo correspondiente o crear un
// nuevo grupo con su arreglo de items.
// -----------------------------------------------------------------------------

export const MENU_CONTABILIDAD = [
  {
    groupLabel: "Inicio",
    items: [
      { label: "Tablero", key: "tablero", path: "/contabilidad/tablero", icon: "dashboard" },
    ],
  },
  {
    groupLabel: "Ventas a Contabilidad",
    items: [
      { label: "Bandeja de facturas", key: "bandeja-facturas", path: "/contabilidad/facturas", icon: "inbox" },
      { label: "Facturas observadas", key: "facturas-observadas", path: "/contabilidad/facturas-observadas", icon: "alert" },
    ],
  },
  {
    groupLabel: "Cuentas por Cobrar",
    items: [
      { label: "Todas las cuentas", key: "cxc-todas", path: "/contabilidad/cuentas", icon: "list" },
      { label: "Proximas a vencer", key: "cxc-proximas", path: "/contabilidad/cuentas-proximas", icon: "clock" },
      { label: "Vencidas", key: "cxc-vencidas", path: "/contabilidad/cuentas-vencidas", icon: "warning" },
    ],
  },
  {
    groupLabel: "Bancos",
    items: [
      { label: "Pagos registrados", key: "bancos-pagos", path: "/contabilidad/bancos/pagos", icon: "credit-card" },
      { label: "Conciliacion", key: "bancos-conciliacion", path: "/contabilidad/bancos/conciliacion", icon: "compare" },
    ],
  },
  {
    groupLabel: "Reportes",
    items: [
      { label: "Resumen mensual", key: "reportes-resumen", path: "/contabilidad/reportes/resumen", icon: "chart" },
      { label: "IVA y Retenciones", key: "reportes-iva", path: "/contabilidad/reportes/iva", icon: "file" },
      { label: "Exportar a Excel / PDF", key: "reportes-exportar", path: "/contabilidad/reportes/exportar", icon: "download" },
    ],
  },
  {
    groupLabel: "Configuracion",
    items: [
      { label: "Catalogo de cuentas", key: "config-catalogo", path: "/contabilidad/configuracion/catalogo", icon: "book" },
      { label: "Parametros de IVA", key: "config-iva", path: "/contabilidad/configuracion/iva", icon: "percent" },
      { label: "Configuracion general", key: "config-general", path: "/contabilidad/configuracion/general", icon: "settings" },
    ],
  },
];

// Nota: para conectar estos items con react-router-dom se puede mapear cada
// objeto a un <Link to={path}> o disparar useNavigate(path). Este archivo solo
// define la configuracion para mantener desac acoplada la capa de UI.
