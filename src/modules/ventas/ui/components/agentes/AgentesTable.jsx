import React from "react";
import THEME from "../../styles/theme";
import ModalBase from "./ModalBase";
import AgenteForm from "./AgenteForm";

const fmtQ = (n) =>
  `Q${(n ?? 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Cell({ children, strong, align = "left", className = "" }) {
  return (
    <div
      className={`px-4 py-3 text-gray-900 whitespace-nowrap ${strong ? "font-semibold" : ""} ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
      } ${className}`}
      style={{ borderRight: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}` }}
    >
      {children}
    </div>
  );
}

export default function AgentesTable({ items = [] }) {
  const [selected, setSelected] = React.useState(null);
  const [formData, setFormData] = React.useState(null);

  const totalEmpleados  = items.length;
  const promComision    = items.length ? items.reduce((a, r) => a + (r.comision || 0), 0) / items.length : 0;
  const sumaCierres     = items.reduce((a, r) => a + (r.cierres || 0), 0);
  const promEfectividad = items.length ? items.reduce((a, r) => a + (r.efectividad || 0), 0) / items.length : 0;

  const sumaSueldoBase  = items.reduce((a, r) => a + (r.sueldoBase || 0), 0);
  const sumaQComision   = items.reduce((a, r) => a + (((r.ventas || 0) * (r.comision || 0)) / 100), 0);
  const sumaTotalPago   = items.reduce((a, r) => a + ((r.sueldoBase || 0) + ((r.ventas || 0) * (r.comision || 0)) / 100), 0);

  const COLS   = "grid-cols-[80px_minmax(240px,1.6fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(150px,1.1fr)_minmax(130px,0.9fr)_minmax(110px,0.8fr)_minmax(170px,1fr)]";
  const TABLE_W = "w-full min-w-[1230px]";

  const getColor = (ef) => (ef >= 95 ? "bg-emerald-500" : ef >= 60 ? "bg-amber-400" : "bg-red-500");

  const openForm  = (row) => { setSelected(row); setFormData({ correo: row.correo||"", dpi: row.dpi||"", telefono: row.telefono||"", direccion: row.direccion||"", ciudad: row.ciudad||"" }); };
  const closeForm = () => { setSelected(null); setFormData(null); };
  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSave   = (e) => { e.preventDefault(); console.log("Guardar:", { id: selected?.id, ...formData }); closeForm(); };

  return (
    <div className="w-full min-h-screen px-6 pb-12" style={{ background: THEME.background }}>
      {/* Título */}
      <div className="flex items-center justify-center gap-3 mt-6 mb-3 w-full text-center">
        <div className="text-5xl leading-none">🗒️</div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ color: THEME.textPrimary }}>
          Catálogo de Agentes y Vendedores
        </h1>
      </div>
      <div className="h-[3px] w-full rounded-full mb-6" style={{ background: `linear-gradient(90deg, ${THEME.headerDark}, ${THEME.header}, ${THEME.headerLight})` }} />

      {/* Tabla */}
      <div className="w-full rounded-3xl shadow-lg ring-1 overflow-hidden" style={{ background: THEME.surface }}>
        <div className={`overflow-x-auto ${items.length > 10 ? "overflow-y-auto" : "overflow-y-visible"}`} style={{ maxHeight: items.length > 9 ? "calc(125vh - 320px)" : "none" }}>
          {/* Header */}
          <div className={`${TABLE_W} grid ${COLS} sticky top-0 z-10`} style={{ borderBottom: `1px solid ${THEME.border}`, background: `linear-gradient(180deg, ${THEME.headerDark}, ${THEME.header})` }}>
            {["ID","Nombre","Sueldo Base","Q. Comisión","Total Pago","% Comisión","Cierres","Efectividad"].map((h, i, arr) => (
              <div key={h} className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: THEME.headerText, borderRight: i===arr.length-1?"none":"1px solid rgba(255,255,255,0.25)" }}>
                <div className="flex items-center justify-between"><span className="tracking-wide">{h}</span><span className="ml-2 text-[10px] opacity-90">▾</span></div>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className={`${TABLE_W}`}>
            {items.map((r, rowIdx) => {
              const qComision = ((r.ventas || 0) * (r.comision || 0)) / 100;
              const totalPago = (r.sueldoBase || 0) + qComision;
              return (
                <div key={r.id} className={`grid ${COLS}`} style={{ background: rowIdx % 2 === 0 ? THEME.stripeAlt : THEME.stripe }}>
                  <Cell>{r.id}</Cell>
                  <Cell strong>
                    <button onClick={() => openForm(r)} className="max-w-[260px] truncate underline-offset-2 hover:underline transition text-left" style={{ color: THEME.accentBlue }} title="Ver/editar datos del vendedor">
                      {r.nombre}
                    </button>
                  </Cell>
                  <Cell align="right">{fmtQ(r.sueldoBase)}</Cell>
                  <Cell align="right">{fmtQ(qComision)}</Cell>
                  <Cell align="right" strong>{fmtQ(totalPago)}</Cell>
                  <Cell align="right">{r.comision ? `${r.comision}%` : ""}</Cell>
                  <Cell align="center">{r.cierres}</Cell>
                  <Cell align="center">
                    <div className="flex items-center justify-between w-full px-2">
                      <span className="font-medium tabular-nums text-gray-800">{r.efectividad}%</span>
                      <div className="flex justify-end w-5">
                        <div className={`w-3 h-3 rounded-full ${getColor(r.efectividad)}`} title={`Efectividad: ${r.efectividad}%`} />
                      </div>
                    </div>
                  </Cell>
                </div>
              );
            })}

            {/* Footer */}
            <div className={`grid ${COLS} sticky bottom-0 z-10`} style={{ borderTop: `1px solid ${THEME.border}`, background: THEME.header }}>
              <div className="px-4 py-3 font-semibold text-white col-span-2 rounded-bl-3xl" style={{ borderRight: `1px solid ${THEME.border}` }}>{totalEmpleados} Empleados</div>
              <div className="px-4 py-3 font-semibold text-right text-white" style={{ borderRight: `1px solid ${THEME.border}` }}>{fmtQ(sumaSueldoBase)}</div>
              <div className="px-4 py-3 font-semibold text-right text-white" style={{ borderRight: `1px solid ${THEME.border}` }}>{fmtQ(sumaQComision)}</div>
              <div className="px-4 py-3 font-semibold text-right text-white" style={{ borderRight: `1px solid ${THEME.border}` }}>{fmtQ(sumaTotalPago)}</div>
              <div className="px-4 py-3 font-semibold text-right text-white" style={{ borderRight: `1px solid ${THEME.border}` }}>{promComision.toFixed(2)}%</div>
              <div className="px-4 py-3 font-semibold text-center text-white" style={{ borderRight: `1px solid ${THEME.border}` }}>{sumaCierres.toFixed(2)}</div>
              <div className="px-4 py-3 font-semibold text-center text-white rounded-br-3xl">{promEfectividad.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalBase open={!!selected} title={selected ? `Datos adicionales — ${selected.nombre}` : ""} onClose={closeForm}>
        <AgenteForm formData={formData} onChange={handleChange} onSave={handleSave} onCancel={closeForm} />
      </ModalBase>
    </div>
  );
}
