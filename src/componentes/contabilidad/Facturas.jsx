// src/componentes/contabilidad/Facturas.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";

const qtz = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

const IVA_RATE = 0.12;

const FACTURAS_MOCK = [
  { id: 1, fecha: "10/09/25", concepto: "20 mesas de paneles", categoria: "La Maquina", sinIva: 50000 },
  { id: 2, fecha: "26/08/25", concepto: "100 Hincas", categoria: "Zambo", sinIva: 10000 },
  { id: 3, fecha: "22/08/25", concepto: "20 mesas de estructura", categoria: "Proyectos Domiciliares", sinIva: 10000 },
  { id: 4, fecha: "28/06/25", concepto: "50 paneles gasolinera", categoria: "Proyectos Comerciales", sinIva: 10000 },
  { id: 5, fecha: "25/08/25", concepto: "mantenimiento de inversor", categoria: "Proyectos Rápidos", sinIva: 10000 },
];

export default function Facturas() {
  const [rows, setRows] = useState(FACTURAS_MOCK);
  const [openMenuRow, setOpenMenuRow] = useState(null);
  const menuRef = useRef(null);

  const totals = useMemo(() => {
    const sinIva = rows.reduce((acc, r) => acc + (r.sinIva || 0), 0);
    const iva = sinIva * IVA_RATE;
    const conIva = sinIva + iva;
    return { sinIva, iva, conIva };
  }, [rows]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenMenuRow(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleMenu = (rowId) => {
    setOpenMenuRow((curr) => (curr === rowId ? null : rowId));
  };

  const handleEdit = (row) => {
    setOpenMenuRow(null);
    // Conecta aquí tu modal/form real
    alert(`Modificar: ${row.concepto}`);
  };

  const handleDelete = (row) => {
    setOpenMenuRow(null);
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <div className="w-full">
      {/* CONTENEDOR sin bordes redondeados (estilo Excel) */}
      <div className="mx-auto max-w-6xl overflow-hidden border border-slate-400 bg-white">
        {/* Franja superior */}
        <div className="bg-[#1d2a3b] px-6 py-3">
          <h2 className="text-center text-lg font-semibold tracking-wide text-[#f39c2b]">
            Cuentas Por Cobrar
          </h2>
        </div>

        {/* Línea fina bajo título */}
        <div className="px-6 pt-2">
          <div className="border-t border-slate-300" />
        </div>

        {/* TABLA principal */}
        <div className="px-4 pb-6 pt-2">
          <div className="overflow-auto border border-slate-400">
            <table className="min-w-full border-collapse text-[14px]">
              <thead ref={menuRef}>
                {/* === Fila de TOTALES alineada a las columnas === */}
                <tr className="bg-white">
                  {/* Vacíos para alinear con las primeras 4 columnas */}
                  <th className="w-10 border-b border-slate-300"></th>
                  <th className="w-32 border-b border-slate-300"></th>
                  <th className="border-b border-slate-300"></th>
                  <th className="w-60 border-b border-slate-300"></th>

                  {/* Totales con estilo amarillo y sin bordes redondeados */}
                  <th className="w-40 border border-amber-300 bg-amber-100 px-3 py-2 text-right font-semibold text-amber-700">
                    {qtz.format(totals.conIva)}
                  </th>
                  <th className="w-40 border border-amber-300 bg-amber-50 px-3 py-2 text-right font-semibold text-slate-900">
                    {qtz.format(totals.sinIva)}
                  </th>
                  <th className="w-40 border border-amber-300 bg-amber-100 px-3 py-2 text-right font-semibold text-amber-700">
                    {qtz.format(totals.iva)}
                  </th>
                </tr>

                {/* === Encabezados (sticky) === */}
                <tr className="bg-[#e9edf5] text-slate-800">
                  <th className="sticky left-0 top-0 z-20 w-10 border border-slate-300 py-2 bg-[#e9edf5]"></th>
                  <th className="top-0 border border-slate-300 px-3 py-2 text-left font-semibold sticky bg-[#e9edf5]">
                    Fecha de ingreso
                  </th>
                  <th className="top-0 border border-slate-300 px-3 py-2 text-left font-semibold sticky bg-[#e9edf5]">
                    Concepto
                  </th>
                  <th className="top-0 w-60 border border-slate-300 px-3 py-2 text-left font-semibold sticky bg-[#e9edf5]">
                    Categoría
                  </th>
                  <th className="top-0 w-40 border border-slate-300 px-3 py-2 text-right font-semibold sticky bg-[#e9edf5]">
                    Con Iva
                  </th>
                  <th className="top-0 w-40 border border-slate-300 px-3 py-2 text-right font-semibold sticky bg-[#e9edf5]">
                    Sin Iva
                  </th>
                  <th className="top-0 w-40 border border-slate-300 px-3 py-2 text-right font-semibold sticky bg-[#e9edf5]">
                    Iva
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, idx) => {
                  const iva = (r.sinIva || 0) * IVA_RATE;
                  const conIva = (r.sinIva || 0) + iva;

                  return (
                    <tr
                      key={r.id}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#f5fbff]`}
                    >
                      {/* Columna izquierda (botón 3 líneas) STICKY */}
                     <td className="sticky left-0 z-10 border border-slate-300 bg-inherit px-0 text-center relative overflow-visible">
                        <div className="relative">
                          <button
                            onClick={() => handleToggleMenu(r.id)}
                            className="mx-auto my-1 flex h-7 w-7 items-center justify-center border border-slate-400 hover:bg-slate-200"
                            title="Opciones"
                          >
                            <span className="flex flex-col gap-[3px]">
                              <span className="block h-[2px] w-4 bg-slate-900"></span>
                              <span className="block h-[2px] w-4 bg-slate-900"></span>
                              <span className="block h-[2px] w-4 bg-slate-900"></span>
                            </span>
                          </button>

                          {openMenuRow === r.id && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-20 w-40 border border-slate-300 bg-white shadow">
                              <button
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                                onClick={() => handleEdit(r)}
                              >
                                Modificar
                              </button>
                              <button
                                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(r)}
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap border border-slate-300 px-3 py-2 text-slate-900">
                        {r.fecha}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-900">
                        {r.concepto}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-slate-900">
                        {r.categoria}
                      </td>

                      {/* Columnas de dinero con fondo amarillo y bordes (sin redondeo) */}
                      <td className="whitespace-nowrap border border-amber-300 bg-amber-50 px-3 py-2 text-right font-semibold">
                        {qtz.format(conIva)}
                      </td>
                      <td className="whitespace-nowrap border border-amber-300 bg-amber-50 px-3 py-2 text-right">
                        {qtz.format(r.sinIva || 0)}
                      </td>
                      <td className="whitespace-nowrap border border-amber-300 bg-amber-50 px-3 py-2 text-right">
                        {qtz.format(iva)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Nota */}
          <p className="mt-3 text-xs text-slate-500">
            * Columnas y encabezado fijos, totales alineados, bordes rectos estilo Excel. IVA al {Math.round(IVA_RATE * 100)}%.
          </p>
        </div>
      </div>
    </div>
  );
}
