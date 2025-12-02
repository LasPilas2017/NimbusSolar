// src/modules/contabilidad/ui/pages/TableroContable.jsx
// -----------------------------------------------------------------------------
// Tablero visual del modulo de contabilidad. Usa datos mock y estilos tipo
// glassmorphism para presentar indicadores, facturas recientes y alertas de
// cuentas por cobrar. En el futuro se conectara a casos de uso e infraestructura
// (Supabase u otra API). Tambien se puede integrar un selector de periodo/fecha.
// -----------------------------------------------------------------------------

import React from "react";
import { motion } from "framer-motion";
import { FileText, Wallet, Banknote, Percent } from "lucide-react";

// Datos de resumen mock (simulan totales del periodo)
const resumenMock = {
  facturasMes: 47,
  montoPorCobrar: 152340.5,
  pagosMes: 98540.75,
  ivaDebito: 18234.12,
};

// Facturas recientes (mock)
const facturasRecientesMock = [
  { cliente: "Cliente Solar", fecha: "2025-01-04", total: 12500, estado: "pendiente" },
  { cliente: "Energia GT", fecha: "2025-01-03", total: 8400, estado: "observada" },
  { cliente: "Comercial Verde", fecha: "2025-01-02", total: 3100, estado: "aprobada" },
  { cliente: "Industrias Luz", fecha: "2025-01-01", total: 22150, estado: "pendiente" },
];

// Alertas de cuentas por cobrar (mock)
const alertasCxcMock = [
  { cliente: "Cliente Solar", dias: 5, monto: 5200, severidad: "media" },
  { cliente: "Comercial Verde", dias: 18, monto: 3100, severidad: "alta" },
  { cliente: "Tecnologia Andina", dias: 30, monto: 8450, severidad: "alta" },
];

// Formatea moneda en Q
const fmtQ = (num) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", minimumFractionDigits: 2 }).format(num);

// Estilos utilitarios para tarjetas glass
const glassCard = "bg-white/5 border border-white/10 backdrop-blur-xl shadow-sm rounded-2xl";

export default function TableroContable() {
  return (
    <div className="space-y-6">
      {/* Encabezado con espacio para futuros filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tablero Contable</h1>
          <p className="text-sm text-slate-600">
            Resumen de facturas, bancos, cuentas por cobrar e impuestos del período actual.
          </p>
        </div>
        {/* Boton de filtros placeholder; aqui se integraria un selector de periodo/fecha */}
        <button
          type="button"
          className="px-4 py-2 text-sm rounded-xl border border-dashed border-slate-300 text-slate-500 bg-white/60"
        >
          Filtros (próximamente)
        </button>
      </div>

      {/* Tarjetas de resumen con glass y animación hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Facturas del mes"
          value={`${resumenMock.facturasMes} emitidas`}
          delta="vs mes anterior +4%"
          icon={FileText}
        />
        <SummaryCard
          title="Monto por cobrar"
          value={fmtQ(resumenMock.montoPorCobrar)}
          delta="vs mes anterior +5%"
          icon={Wallet}
        />
        <SummaryCard
          title="Pagos bancarios del mes"
          value={fmtQ(resumenMock.pagosMes)}
          delta="vs mes anterior -2%"
          icon={Banknote}
        />
        <SummaryCard
          title="IVA débito del mes"
          value={fmtQ(resumenMock.ivaDebito)}
          delta="Estimado del período"
          icon={Percent}
        />
      </div>

      {/* Paneles inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel de facturas recientes */}
        <div className={`${glassCard} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Facturas recientes</h3>
              <p className="text-xs text-slate-500">Últimos registros recibidos desde ventas</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/5">
            <table className="min-w-full text-sm text-slate-700">
              <thead className="bg-white/5 text-slate-500">
                <tr>
                  <th className="py-2 px-3 text-left">Cliente</th>
                  <th className="py-2 px-3 text-left">Fecha</th>
                  <th className="py-2 px-3 text-left">Total</th>
                  <th className="py-2 px-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white/30">
                {facturasRecientesMock.map((fac, idx) => (
                  <tr key={`${fac.cliente}-${idx}`} className="border-b border-white/10">
                    <td className="py-2 px-3">{fac.cliente}</td>
                    <td className="py-2 px-3 text-slate-600">{fac.fecha}</td>
                    <td className="py-2 px-3 font-semibold">{fmtQ(fac.total)}</td>
                    <td className="py-2 px-3">
                      <EstadoPill estado={fac.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de alertas de CxC */}
        <div className={`${glassCard} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Alertas de cuentas por cobrar</h3>
              <p className="text-xs text-slate-500">Clientes con riesgo o atraso</p>
            </div>
          </div>
          <div className="space-y-3">
            {alertasCxcMock.map((alerta, idx) => (
              <div
                key={`${alerta.cliente}-${idx}`}
                className={`${glassCard} p-3 flex items-center justify-between`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{alerta.cliente}</p>
                  <p className="text-xs text-slate-500">Días de atraso: {alerta.dias}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{fmtQ(alerta.monto)}</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${
                      alerta.severidad === "alta"
                        ? "bg-red-500/15 text-red-700"
                        : "bg-amber-500/15 text-amber-700"
                    }`}
                  >
                    {alerta.severidad === "alta" ? "Riesgo alto" : "Atención"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tarjeta de resumen con animación suave en hover
function SummaryCard({ title, value, delta, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
      className={`${glassCard} p-4 flex items-start justify-between`}
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-emerald-600">{delta}</p>
      </div>
      <div className="p-3 rounded-xl bg-white/20 text-slate-900">
        <Icon size={20} />
      </div>
    </motion.div>
  );
}

// Pill para estado de factura
function EstadoPill({ estado }) {
  const color =
    estado === "aprobada"
      ? "bg-emerald-500/15 text-emerald-700"
      : estado === "observada"
      ? "bg-amber-500/15 text-amber-700"
      : "bg-slate-500/15 text-slate-700";

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${color}`}>
      {estado}
    </span>
  );
}
