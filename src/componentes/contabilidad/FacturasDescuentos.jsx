// src/componentes/contabilidad/FacturasDescuentos.jsx
import React, { useMemo, useState } from "react";

const qtz = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

// IVA país (si lo necesitas en otro lado cámbialo aquí)
const IVA_RATE = 0.12;

/**
 * Props opcionales:
 * - facturaId: number | string (solo informativo)
 * - descuentosIniciales: Array<{ id, concepto, monto, porcRetIva }>
 * - onAgregar: (nuevo) => void   // callback al guardar
 * - onEliminar: (id) => void     // opcional
 */
export default function FacturasDescuentos({
  facturaId = null,
  descuentosIniciales,
  onAgregar,
  onEliminar,
}) {
  // Mock si no mandan descuentos
  const MOCK = [
    { id: 1, concepto: "Pronto pago", monto: 1500, porcRetIva: 30 },
    { id: 2, concepto: "Descuento comercial", monto: 800, porcRetIva: 0 },
  ];

  const [descuentos, setDescuentos] = useState(
    Array.isArray(descuentosIniciales) ? descuentosIniciales : MOCK
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    concepto: "",
    monto: "",
    porcRetIva: "",
  });

  // Calculados de la fila de captura
  const montoNum = Number(form.monto || 0);
  const porcNum = Number(form.porcRetIva || 0);
  const ivaDelMonto = montoNum * IVA_RATE;
  const retencionIvaCalc = ivaDelMonto * (isNaN(porcNum) ? 0 : porcNum / 100);

  const totalRetenido = useMemo(
    () =>
      descuentos.reduce((acc, d) => {
        const iva = Number(d.monto || 0) * IVA_RATE;
        const ret = iva * (Number(d.porcRetIva || 0) / 100);
        return acc + ret;
      }, 0),
    [descuentos]
  );

  const resetForm = () =>
    setForm({ concepto: "", monto: "", porcRetIva: "" });

  const handleSave = () => {
    const concepto = form.concepto.trim();
    const monto = Number(form.monto);
    const porcRetIva = Number(form.porcRetIva);

    if (!concepto) {
      alert("Escribe el concepto del descuento.");
      return;
    }
    if (isNaN(monto) || monto <= 0) {
      alert("Ingresa un monto válido (> 0).");
      return;
    }
    if (isNaN(porcRetIva) || porcRetIva < 0) {
      alert("Ingresa un porcentaje de retención de IVA válido (>= 0).");
      return;
    }

    const nuevo = {
      id: descuentos.length ? Math.max(...descuentos.map((d) => d.id)) + 1 : 1,
      concepto,
      monto,
      porcRetIva,
    };

    setDescuentos((prev) => [nuevo, ...prev]); // historial arriba primero
    onAgregar?.(nuevo);

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id) => {
    setDescuentos((prev) => prev.filter((d) => d.id !== id));
    onEliminar?.(id);
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl overflow-hidden border border-slate-400 bg-white">
        {/* Encabezado */}
        <div className="bg-[#1d2a3b] px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              {facturaId ? `Factura #${facturaId}` : "\u00A0"}
            </div>
            <h2 className="text-[#f39c2b] text-base font-semibold tracking-wide">
              Descuentos de la Cuenta
            </h2>
            <button
              onClick={() => {
                setShowForm((s) => !s);
                if (!showForm) resetForm();
              }}
              className="h-8 px-3 text-white border border-white/50 hover:bg-white/10"
              title="Agregar descuento"
            >
              Agregar descuento
            </button>
          </div>
        </div>

        {/* Tabla estilo Excel */}
        <div className="px-4 pb-5 pt-2">
          <div className="overflow-auto border border-slate-400">
            <table className="min-w-full border-collapse text-[14px]">
              <thead>
                {/* Totales (solo retención) */}
                <tr className="bg-white">
                  <th className="border-b border-slate-300"></th>
                  <th className="border-b border-slate-300"></th>
                  <th className="border-b border-slate-300"></th>
                  <th className="w-44 border border-amber-300 bg-amber-100 px-3 py-2 text-right font-semibold text-amber-700">
                    {qtz.format(totalRetenido)}
                  </th>
                </tr>

                <tr className="bg-[#e9edf5] text-slate-800">
                  <th className="top-0 border border-slate-300 px-3 py-2 text-left font-semibold sticky bg-[#e9edf5]">
                    Concepto del descuento
                  </th>
                  <th className="top-0 w-40 border border-slate-300 px-3 py-2 text-right font-semibold sticky bg-[#e9edf5]">
                    Monto del descuento
                  </th>
                  <th className="top-0 w-48 border border-slate-300 px-3 py-2 text-right font-semibold sticky bg-[#e9edf5]">
                    % Retención de IVA
                  </th>
                  <th className="top-0 w-44 border border-slate-300 px-3 py-2 text-right font-semibold sticky bg-[#e9edf5]">
                    Retención de IVA
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Fila de captura */}
                {showForm && (
                  <tr className="bg-white">
                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        type="text"
                        placeholder="Concepto del descuento"
                        value={form.concepto}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, concepto: e.target.value }))
                        }
                        className="w-full outline-none"
                      />
                    </td>

                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.monto}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, monto: e.target.value }))
                        }
                        className="w-full text-right outline-none"
                      />
                    </td>

                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={form.porcRetIva}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, porcRetIva: e.target.value }))
                        }
                        className="w-full text-right outline-none"
                      />
                    </td>

                    {/* Retención calculada (solo lectura) */}
                    <td className="border border-amber-300 bg-amber-100 px-2 py-1 text-right font-semibold">
                      {qtz.format(isFinite(retencionIvaCalc) ? retencionIvaCalc : 0)}
                    </td>
                  </tr>
                )}

                {/* Historial (primero) */}
                {descuentos.map((d) => {
                  const iva = Number(d.monto || 0) * IVA_RATE;
                  const retencion = iva * (Number(d.porcRetIva || 0) / 100);
                  return (
                    <tr key={d.id} className="hover:bg-[#f5fbff]">
                      <td className="border border-slate-300 px-3 py-2">
                        {d.concepto}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right">
                        {qtz.format(d.monto || 0)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right">
                        {(Number(d.porcRetIva || 0)).toFixed(2)}%
                      </td>
                      <td className="border border-amber-300 bg-amber-50 px-3 py-2 text-right">
                        {qtz.format(retencion)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Botones de acción para la fila de captura */}
          {showForm && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 border border-slate-400 hover:bg-slate-100"
                title="Guardar descuento"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-3 py-1 border border-slate-400 hover:bg-slate-100"
                title="Cancelar"
              >
                Cancelar
              </button>
              <div className="ml-auto text-xs text-slate-500">
                IVA del monto: {qtz.format(ivaDelMonto)} · Retención calculada:{" "}
                {qtz.format(retencionIvaCalc)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* (Opcional) acciones sobre historial */}
      {descuentos.length > 0 && (
        <div className="mx-auto max-w-4xl mt-2 text-xs text-slate-600">
          Historial mostrado primero. IVA {Math.round(IVA_RATE * 100)}%.
        </div>
      )}
    </div>
  );
}
