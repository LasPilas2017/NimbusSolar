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

const resumenMock = {
  facturasMes: 47,
  montoPorCobrar: 152340.5,
  pagosMes: 98540.75,
  ivaDebito: 18234.12,
};

const facturasRecientesMock = [
  { cliente: "Cliente Solar", fecha: "2025-01-04", total: 12500, estado: "pendiente" },
  { cliente: "Energia GT", fecha: "2025-01-03", total: 8400, estado: "observada" },
  { cliente: "Comercial Verde", fecha: "2025-01-02", total: 3100, estado: "aprobada" },
  { cliente: "Industrias Luz", fecha: "2025-01-01", total: 22150, estado: "pendiente" },
];

const alertasCxcMock = [
  { cliente: "Cliente Solar", dias: 5, monto: 5200, severidad: "media" },
  { cliente: "Comercial Verde", dias: 18, monto: 3100, severidad: "alta" },
  { cliente: "Tecnologia Andina", dias: 30, monto: 8450, severidad: "alta" },
];

const fmtQ = (num) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", minimumFractionDigits: 2 }).format(num);

// Estilos utilitarios para tarjetas glass con look futurista
const glassCard =
  "rounded-3xl bg-white/60 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-white/20 p-6";

export default function TableroContable() {
  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-100 via-white to-gray-200 p-2 md:p-3 rounded-3xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Tablero Contable</h1>
          <p className="text-sm md:text-base text-gray-500 font-light">
            Resumen de facturas, bancos, cuentas por cobrar e impuestos del período actual.
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-sm rounded-full border border-dashed border-white/30 bg-white/60 backdrop-blur-md text-gray-600 shadow-sm"
        >
          Filtros (próximamente)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={glassCard}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Facturas recientes</h3>
              <p className="text-xs text-gray-500 font-light">Últimos registros recibidos desde ventas</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-white/70 text-gray-500">
                <tr>
                  <th className="py-3 px-4 text-left">Cliente</th>
                  <th className="py-3 px-4 text-left">Fecha</th>
                  <th className="py-3 px-4 text-left">Total</th>
                  <th className="py-3 px-4 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white/70">
                {facturasRecientesMock.map((fac, idx) => (
                  <tr key={`${fac.cliente}-${idx}`} className="border-b border-white/30">
                    <td className="py-3 px-4">{fac.cliente}</td>
                    <td className="py-3 px-4 text-gray-600">{fac.fecha}</td>
                    <td className="py-3 px-4 font-semibold">{fmtQ(fac.total)}</td>
                    <td className="py-3 px-4">
                      <EstadoPill estado={fac.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={glassCard}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Alertas de cuentas por cobrar</h3>
              <p className="text-xs text-gray-500 font-light">Clientes con riesgo o atraso</p>
            </div>
          </div>
          <div className="space-y-3">
            {alertasCxcMock.map((alerta, idx) => (
              <div
                key={`${alerta.cliente}-${idx}`}
                className={`${glassCard} p-4 flex items-center justify-between bg-white/70`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">{alerta.cliente}</p>
                  <p className="text-xs text-gray-500">Días de atraso: {alerta.dias}</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-sm font-bold text-gray-800">{fmtQ(alerta.monto)}</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
                      alerta.severidad === "alta"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
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

function SummaryCard({ title, value, delta, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${glassCard} flex items-start justify-between`}
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        <span className="inline-flex rounded-full px-3 py-1 bg-white/40 backdrop-blur-md border border-white/20 text-gray-700">
          {delta}
        </span>
      </div>
      <div className="p-3 rounded-3xl bg-white/70 text-gray-800 shadow-[0_6px_14px_rgba(0,0,0,0.06)]">
        <Icon size={22} />
      </div>
    </motion.div>
  );
}

function EstadoPill({ estado }) {
  const color =
    estado === "aprobada"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : estado === "observada"
      ? "bg-amber-100 text-amber-700 border border-amber-200"
      : "bg-slate-100 text-slate-700 border border-slate-200";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${color}`}>
      {estado}
    </span>
  );
}
