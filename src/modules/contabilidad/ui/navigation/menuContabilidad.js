// src/modules/contabilidad/ui/navigation/menuContabilidad.js
// -----------------------------------------------------------------------------
// Configuración del menú lateral del módulo de contabilidad.
// - groupKey: identificador único del grupo (se usa para abrir/cerrar).
// - label: texto que se muestra en el botón principal.
// - icon: nombre del componente de lucide-react a usar (ej. LayoutDashboard).
// - items: sub-botones con { label, key, path } para navegar dentro del módulo.
//
// Para agregar un nuevo grupo:
//   1) Crear un objeto { groupKey, label, icon, items: [] }.
//   2) Insertarlo en el arreglo MENU_CONTABILIDAD.
//
// Para agregar un sub-botón:
//   1) Ubicar el grupo deseado.
//   2) Añadir { label, key, path } dentro de items.
// -----------------------------------------------------------------------------

export const MENU_CONTABILIDAD = [
  {
    groupKey: "inicio",
    label: "Inicio",
    icon: "LayoutDashboard",
    isFromDocument: true, // En el flujo original se inicia en el tablero contable
    items: [
      { label: "Tablero", key: "tablero", path: "/contabilidad/tablero", isFromDocument: true },
    ],
  },
  {
    groupKey: "ventas",
    label: "Ventas a Contabilidad",
    icon: "Inbox",
    isFromDocument: true, // Flujo ventas -> contabilidad
    items: [
      { label: "Bandeja de facturas", key: "bandeja-facturas", path: "/contabilidad/bandeja-facturas", isFromDocument: true },
      { label: "Facturas observadas", key: "facturas-observadas", path: "/contabilidad/facturas-observadas", isFromDocument: true },
    ],
  },
  // Grupo para manejar gastos internos (combustible, viáticos, repuestos, etc.)
  {
    groupKey: "compras-gastos",
    label: "Compras y Gastos",
    icon: "Receipt",
    isFromDocument: false,
    items: [
      { label: "Registrar gasto", key: "compras-registrar", path: "/contabilidad/compras/registrar-gasto", isFromDocument: false },
      { label: "Historial de gastos", key: "compras-historial", path: "/contabilidad/compras/historial-gastos", isFromDocument: false },
      { label: "Categorías de gastos", key: "compras-categorias", path: "/contabilidad/compras/categorias-gastos", isFromDocument: false },
    ],
  },
  {
    groupKey: "cxc",
    label: "Cuentas por Cobrar",
    icon: "ListChecks",
    isFromDocument: true, // Parte del flujo contable (archivo -> CxC)
    items: [
      { label: "Todas las cuentas", key: "cxc-todas", path: "/contabilidad/cuentas-por-cobrar", isFromDocument: true },
      { label: "Próximas a vencer", key: "cxc-proximas", path: "/contabilidad/cuentas-por-cobrar/proximas", isFromDocument: true },
      { label: "Vencidas", key: "cxc-vencidas", path: "/contabilidad/cuentas-por-cobrar/vencidas", isFromDocument: true },
    ],
  },
  // Grupo para gestionar facturas y pagos a proveedores
  {
    groupKey: "cxp",
    label: "Cuentas por Pagar",
    icon: "FileSpreadsheet",
    isFromDocument: false,
    items: [
      { label: "Facturas por pagar", key: "cxp-facturas", path: "/contabilidad/cxp/facturas-por-pagar", isFromDocument: false },
      { label: "Facturas vencidas", key: "cxp-vencidas", path: "/contabilidad/cxp/facturas-vencidas", isFromDocument: false },
      { label: "Pagos realizados", key: "cxp-pagos", path: "/contabilidad/cxp/pagos-realizados", isFromDocument: false },
    ],
  },
  {
    groupKey: "bancos",
    label: "Bancos",
    icon: "CreditCard",
    isFromDocument: true, // Flujo incluye bancos y conciliación
    items: [
      { label: "Pagos registrados", key: "bancos-pagos", path: "/contabilidad/bancos/pagos", isFromDocument: true },
      { label: "Conciliación", key: "bancos-conciliacion", path: "/contabilidad/bancos/conciliacion", isFromDocument: true },
    ],
  },
  // Grupo para gestionar activos fijos y depreciaciones
  {
    groupKey: "activos",
    label: "Activos Fijos",
    icon: "Boxes",
    isFromDocument: false,
    items: [
      { label: "Listado de activos", key: "activos-listado", path: "/contabilidad/activos/listado", isFromDocument: false },
      { label: "Registrar activo", key: "activos-registrar", path: "/contabilidad/activos/registrar", isFromDocument: false },
      { label: "Depreciación mensual", key: "activos-depreciacion", path: "/contabilidad/activos/depreciacion-mensual", isFromDocument: false },
      { label: "Bajas contables", key: "activos-bajas", path: "/contabilidad/activos/bajas", isFromDocument: false },
    ],
  },
  // Grupo para declaraciones de impuestos
  {
    groupKey: "fiscales",
    label: "Declaraciones Fiscales",
    icon: "ClipboardList",
    isFromDocument: false,
    items: [
      { label: "IVA", key: "fiscales-iva", path: "/contabilidad/fiscales/iva", isFromDocument: false },
      { label: "Retenciones", key: "fiscales-retenciones", path: "/contabilidad/fiscales/retenciones", isFromDocument: false },
      { label: "ISR", key: "fiscales-isr", path: "/contabilidad/fiscales/isr", isFromDocument: false },
    ],
  },
  // Grupo para centros de costos y proyectos
  {
    groupKey: "centro-costos",
    label: "Centro de Costos / Proyectos",
    icon: "LayoutGrid",
    isFromDocument: false,
    items: [
      { label: "Gastos por proyecto", key: "costos-proyecto", path: "/contabilidad/centro-costos/gastos-proyecto", isFromDocument: false },
      { label: "Centro de costos", key: "costos-listado", path: "/contabilidad/centro-costos/listado", isFromDocument: false },
    ],
  },
  // Grupo para auditoría y trazabilidad
  {
    groupKey: "auditoria",
    label: "Auditoría",
    icon: "ShieldCheck",
    isFromDocument: false,
    items: [
      { label: "Bitácora general", key: "auditoria-bitacora", path: "/contabilidad/auditoria/bitacora-general", isFromDocument: false },
      { label: "Actividad por usuario", key: "auditoria-usuario", path: "/contabilidad/auditoria/actividad-usuario", isFromDocument: false },
    ],
  },
  {
    groupKey: "reportes",
    label: "Reportes",
    icon: "BarChart3",
    isFromDocument: true, // Incluye resumen mensual, IVA y flujo contable
    items: [
      { label: "Resumen mensual", key: "reportes-resumen", path: "/contabilidad/reportes/mensual", isFromDocument: true },
      { label: "IVA y Retenciones", key: "reportes-iva", path: "/contabilidad/reportes/iva", isFromDocument: true },
      { label: "Exportar a Excel / PDF", key: "reportes-exportar", path: "/contabilidad/reportes/exportar", isFromDocument: false },
      // Libros contables y estados financieros
      { label: "Libro Diario", key: "reportes-diario", path: "/contabilidad/reportes/diario", isFromDocument: false },
      { label: "Libro Mayor", key: "reportes-mayor", path: "/contabilidad/reportes/mayor", isFromDocument: false },
      { label: "Balanza", key: "reportes-balanza", path: "/contabilidad/reportes/balanza", isFromDocument: false },
      { label: "Estado de Resultados", key: "reportes-er", path: "/contabilidad/reportes/estado-resultados", isFromDocument: false },
      { label: "Balance General", key: "reportes-bg", path: "/contabilidad/reportes/balance-general", isFromDocument: false },
    ],
  },
  {
    groupKey: "config",
    label: "Configuración",
    icon: "Settings",
    isFromDocument: true, // Parte del flujo: parámetros IVA, catálogo
    items: [
      { label: "Catálogo de cuentas", key: "config-catalogo", path: "/contabilidad/configuracion/cuentas", isFromDocument: true },
      { label: "Parámetros de IVA", key: "config-iva", path: "/contabilidad/configuracion/iva", isFromDocument: true },
      { label: "Configuración general", key: "config-general", path: "/contabilidad/configuracion/general", isFromDocument: false },
    ],
  },
  {
    groupKey: "planilla",
    label: "Planilla",
    icon: "Users",
    isFromDocument: false,
    items: [
      // Pestaña para gestion de planilla dentro de contabilidad
      { label: "Planilla en curso", key: "planilla-curso", path: "/contabilidad/planilla/curso", isFromDocument: false },
      { label: "Planillas pasadas", key: "planilla-historico", path: "/contabilidad/planilla/historico", isFromDocument: false },
    ],
  },
];
