// src/componentes/contabilidad/FacturasDescuentos.jsx
import React, { useMemo, useState } from "react";

const qtz = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

const FILAS_INICIALES = [
  // Puedes dejar vacíos o precargar un ejemplo
  { id: 1, concepto: "", monto: 0, porcentaje: 15 },
  { id: 2, concepto: "", monto: 0, porcentaje: 0 },
  { id: 3, concepto: "", monto: 0, porcentaje: 0 },
  { id: 4, concepto: "", monto: 0, porcentaje: 0 },
  { id: 5, concepto: "", monto: 0, porcentaje: 0 },
];

export default function FacturasDescuentos() {
  const [rows, setRows] = useState(FILAS_INICIALES);

  const totales = useMemo(() => {
    const totalRet = rows.reduce(
      (acc, r) => acc + (Number(r.monto) || 0) * ((Number(r.porcentaje) || 0) / 100),
      0
    );
    const totalCobro = rows.reduce(
      (acc, r) => acc + (Number(r.monto) || 0) - (Number(r.monto) || 0) * ((Number(r.porcentaje) || 0) / 100),
      0
    );
    return { totalRet, totalCobro };
  }, [rows]);

  const actualizar = (id, campo, valor) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [campo]: campo === "concepto" ? valor : Number(valor) } : r))
    );
  };

  const agregarFila = () => {
    setRows((prev) => [
      ...prev,
      { id: prev.length ? Math.max(...prev.map((r) => r.id)) + 1 : 1, concepto: "", monto: 0, porcentaje: 0 },
    ]);
  };

  const limpiar = () => setRows(FILAS_INICIALES);

  return (
    <div className="w-full">
      {/* CONTENEDOR estilo Excel (sin bordes redondos) */}
      <div className="mx-auto max-w-6xl overflow-hidden border border-slate-400 bg-white">
        {/* Franja superior con título */}
        <div className="bg-[#1d2a3b] px-6 py-3">
          <h2 className="text-center text-lg font-semibold tracking-wide text-[#6b7c93]">
            Descuentos
          </h2>
        </div>

        {/* Línea fina */}
        <div className="px-6 pt-1">
          <div className="border-t border-slate-300" />
        </div>

        {/* TABLA */}
        <div className="px-4 pb-5 pt-2">
          <div className="overflow-auto border border-slate-400">
            <table className="min-w-full border-collapse text-[14px]">
              <thead>
                {/* Fila de totales, alineada a últimas columnas */}
                <tr className="bg-white">
                  <th className="border-b border-slate-300 w-[38%]"></th>
                  <th className="border-b border-slate-300 w-[18%]"></th>
                  <th className="border-b border-slate-300 w-[16%]"></th>

                  <th className="w-[14%] border border-amber-300 bg-amber-100 px-3 py-2 text-right font-semibold text-amber-700">
                    {qtz.format(totales.totalRet)}
                  </th>
                  <th className="w-[14%] border border-amber-300 bg-amber-50 px-3 py-2 text-right font-semibold text-slate-900">
                    {qtz.format(totales.totalCobro)}
                  </th>
                </tr>

                {/* Encabezados */}
                <tr className="bg-[#e9edf5] text-slate-800">
                  <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                    <span className="block">Concepto</span>
                    <span className="block text-[12px] italic text-slate-600 -mt-0.5">
                      Del Descuento
                    </span>
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                    <span className="block">Monto</span>
                    <span className="block text-[12px] italic text-slate-600 -mt-0.5">
                      Del Descuento
                    </span>
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-left font-semibold">
                    <span className="block">Porcentaje</span>
                    <span className="block text-[12px] italic text-slate-600 -mt-0.5">
                      De Retención De Iva
                    </span>
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    <span className="block">Retención</span>
                    <span className="block text-[12px] italic text-slate-600 -mt-0.5">
                      De Iva
                    </span>
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-right font-semibold">
                    Cobro Final
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, idx) => {
                  const ret = (Number(r.monto) || 0) * ((Number(r.porcentaje) || 0) / 100);
                  const cobro = (Number(r.monto) || 0) - ret;

                  return (
                    <tr
                      key={r.id}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#f5fbff]`}
                    >
                      {/* Concepto */}
                      <td className="border border-slate-300 px-2 py-1">
                        <input
                          type="text"
                          value={r.concepto}
                          onChange={(e) => actualizar(r.id, "concepto", e.target.value)}
                          className="w-full border-none bg-transparent p-1 outline-none"
                          placeholder=""
                        />
                      </td>

                      {/* Monto del descuento */}
                      <td className="border border-slate-300 px-2 py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Q</span>
                          <input
                            type="number"
                            step="0.01"
                            value={r.monto}
                            onChange={(e) => actualizar(r.id, "monto", e.target.value)}
                            className="w-full border-none bg-transparent p-1 text-right outline-none"
                          />
                        </div>
                      </td>

                      {/* % Retención de IVA */}
                      <td className="border border-slate-300 px-2 py-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={r.porcentaje}
                            onChange={(e) => actualizar(r.id, "porcentaje", e.target.value)}
                            className="w-full border-none bg-transparent p-1 text-right outline-none"
                          />
                          <span className="text-slate-600">%</span>
                        </div>
                      </td>

                      {/* Retención de IVA (celda amarilla con borde) */}
                      <td className="border border-amber-300 bg-amber-50 px-3 py-2 text-right font-medium">
                        {qtz.format(ret)}
                      </td>

                      {/* Cobro Final */}
                      <td className="border border-amber-300 bg-amber-50 px-3 py-2 text-right font-semibold">
                        {qtz.format(cobro)}
                      </td>
                    </tr>
                  );
                })}

                {/* Fila acciones simples */}
                <tr>
                  <td className="border border-slate-300 px-2 py-2">
                    <button
                      className="border border-slate-500 px-2 py-1 text-[12px]"
                      onClick={agregarFila}
                    >
                      + Agregar fila
                    </button>
                  </td>
                  <td className="border border-slate-300 px-2 py-2" colSpan={3}></td>
                  <td className="border border-slate-300 px-2 py-2 text-right">
                    <button
                      className="border border-slate-500 px-2 py-1 text-[12px]"
                      onClick={limpiar}
                    >
                      Restablecer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            * Estilo tipo Excel: sin bordes redondeados, bordes finos en cada
            celda, encabezados dobles y celdas de totales alineadas con las columnas.
          </p>
        </div>
      </div>
    </div>
  );
}
