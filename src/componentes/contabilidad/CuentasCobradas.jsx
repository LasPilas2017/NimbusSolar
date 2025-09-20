// src/componentes/contabilidad/CuentasCobradas.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";

const qtz = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  minimumFractionDigits: 2,
});

const IVA_RATE = 0.12;

// === Helpers ===
const toNum = (v) => {
  const n = Number(String(v).replace(/[, ]/g, ""));
  return isNaN(n) ? 0 : n;
};

const fromSinIva = (sinIva) => {
  const iva = sinIva * IVA_RATE;
  const conIva = sinIva + iva;
  return { sinIva, iva, conIva };
};

const fromIva = (iva) => {
  const sinIva = iva / IVA_RATE;
  const conIva = sinIva + iva;
  return { sinIva, iva, conIva };
};

const fromConIva = (conIva) => {
  const sinIva = conIva / (1 + IVA_RATE);
  const iva = conIva - sinIva;
  return { sinIva, iva, conIva };
};

// Mock inicial (agregamos 'pagado')
const COBRADAS_MOCK = [
  { id: 1, fecha: "10/09/25", fechaCobro: "20/09/25", concepto: "20 mesas de paneles", categoria: "La Maquina", sinIva: 50000, pagado: true },
  { id: 2, fecha: "26/08/25", fechaCobro: "05/09/25", concepto: "100 Hincas", categoria: "Zambo", sinIva: 10000, pagado: false },
  { id: 3, fecha: "22/08/25", fechaCobro: "01/09/25", concepto: "20 mesas de estructura", categoria: "Proyectos Domiciliares", sinIva: 10000, pagado: true },
];

export default function CuentasCobradas() {
  const [rows, setRows] = useState(COBRADAS_MOCK);
  const [openMenuRow, setOpenMenuRow] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const menuRef = useRef(null);

  // --- Form de “Nuevo cobro” ---
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fecha: "",
    fechaCobro: "",
    concepto: "",
    categoria: "",
    sinIva: "",
    iva: "",
    conIva: "",
    pagado: false,       // ✅ checkbox SOLO para indicar si ya se pagó
    lastEdited: "sinIva",
  });

  // Cerrar menú contextual al hacer clic fuera
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

  // === Totales (Cobro final usa SIEMPRE Con IVA) ===
  const totals = useMemo(() => {
    const sinIva = rows.reduce((a, r) => a + toNum(r.sinIva || 0), 0);
    const iva = sinIva * IVA_RATE;
    const conIva = sinIva + iva;
    const cobroFinal = conIva; // definimos “cobro final” = Con IVA
    return { sinIva, iva, conIva, cobroFinal };
  }, [rows]);

  // === Nuevo cobro ===
  const handleNewClick = () => {
    setShowForm((s) => !s);
    setForm({
      fecha: "",
      fechaCobro: "",
      concepto: "",
      categoria: "",
      sinIva: "",
      iva: "",
      conIva: "",
      pagado: false,
      lastEdited: "sinIva",
    });
  };

  const recalcMoney = (baseField, value, current) => {
    const v = toNum(value);
    if (baseField === "sinIva") {
      const { sinIva, iva, conIva } = fromSinIva(v);
      return { ...current, sinIva, iva, conIva, lastEdited: "sinIva" };
    }
    if (baseField === "iva") {
      const { sinIva, iva, conIva } = fromIva(v);
      return { ...current, sinIva, iva, conIva, lastEdited: "iva" };
    }
    const { sinIva, iva, conIva } = fromConIva(v);
    return { ...current, sinIva, iva, conIva, lastEdited: "conIva" };
  };

  const handleFormChange = (field, value) => {
    if (field === "sinIva" || field === "iva" || field === "conIva") {
      setForm((f) => recalcMoney(field, value, f));
    } else if (field === "pagado") {
      setForm((f) => ({ ...f, pagado: !!value }));
    } else {
      setForm((f) => ({ ...f, [field]: value }));
    }
  };

  const handleFormSave = () => {
    const fecha = form.fecha?.trim();
    const fechaCobro = form.fechaCobro?.trim();
    const concepto = form.concepto?.trim();
    const categoria = form.categoria?.trim();

    const sinIva = toNum(form.sinIva);
    const iva = toNum(form.iva);
    const conIva = toNum(form.conIva);

    if (!fecha || !fechaCobro || !concepto || !categoria) {
      alert("Completa Fecha de ingreso, Fecha de cobro, Concepto y Categoría.");
      return;
    }
    if (sinIva === 0 && iva === 0 && conIva === 0) {
      alert("Ingresa al menos uno de los montos (Con IVA / Sin IVA / IVA).");
      return;
    }

    let money = { sinIva, iva, conIva };
    if (form.lastEdited === "iva") money = fromIva(iva);
    else if (form.lastEdited === "conIva") money = fromConIva(conIva);
    else money = fromSinIva(sinIva);

    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows((prev) => [
      ...prev,
      {
        id: nextId,
        fecha,
        fechaCobro,
        concepto,
        categoria,
        sinIva: money.sinIva,
        pagado: !!form.pagado, // ✅ se guarda el estado de pago
      },
    ]);

    setShowForm(false);
    setForm({
      fecha: "",
      fechaCobro: "",
      concepto: "",
      categoria: "",
      sinIva: "",
      iva: "",
      conIva: "",
      pagado: false,
      lastEdited: "sinIva",
    });
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setForm({
      fecha: "",
      fechaCobro: "",
      concepto: "",
      categoria: "",
      sinIva: "",
      iva: "",
      conIva: "",
      pagado: false,
      lastEdited: "sinIva",
    });
  };

  // === Edición ===
  const [editDraft, setEditDraft] = useState(null);

  const startEdit = (row) => {
    setOpenMenuRow(null);
    setEditRowId(row.id);
    const iva = row.sinIva * IVA_RATE;
    const conIva = row.sinIva + iva;
    setEditDraft({
      id: row.id,
      fecha: row.fecha,
      fechaCobro: row.fechaCobro || "",
      concepto: row.concepto,
      categoria: row.categoria,
      sinIva: row.sinIva,
      iva,
      conIva,
      pagado: !!row.pagado,
      lastEdited: "sinIva",
    });
  };

  const editChange = (field, value) => {
    if (!editDraft) return;
    if (field === "sinIva" || field === "iva" || field === "conIva") {
      setEditDraft((d) => recalcMoney(field, value, d));
    } else if (field === "pagado") {
      setEditDraft((d) => ({ ...d, pagado: !!value }));
    } else {
      setEditDraft((d) => ({ ...d, [field]: value }));
    }
  };

  const saveEdit = () => {
    if (!editDraft) return;
    const { fecha, fechaCobro, concepto, categoria } = editDraft;
    if (!fecha?.trim() || !fechaCobro?.trim() || !concepto?.trim() || !categoria?.trim()) {
      alert("Completa Fecha de ingreso, Fecha de cobro, Concepto y Categoría.");
      return;
    }

    let money = {
      sinIva: toNum(editDraft.sinIva),
      iva: toNum(editDraft.iva),
      conIva: toNum(editDraft.conIva),
    };
    if (editDraft.lastEdited === "iva") money = fromIva(money.iva);
    else if (editDraft.lastEdited === "conIva") money = fromConIva(money.conIva);
    else money = fromSinIva(money.sinIva);

    setRows((prev) =>
      prev.map((r) =>
        r.id === editDraft.id
          ? {
              ...r,
              fecha: editDraft.fecha,
              fechaCobro: editDraft.fechaCobro,
              concepto: editDraft.concepto,
              categoria: editDraft.categoria,
              sinIva: money.sinIva,
              pagado: !!editDraft.pagado, // ✅ guardar estado de pago
            }
          : r
      )
    );
    setEditRowId(null);
    setEditDraft(null);
  };

  const cancelEdit = () => {
    setEditRowId(null);
    setEditDraft(null);
  };

  const handleDelete = (row) => {
    setOpenMenuRow(null);
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    if (editRowId === row.id) cancelEdit();
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl overflow-hidden border border-slate-400 bg-white">
        {/* Header */}
        <div className="bg-[#1d2a3b] px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="w-8" />
            <h2 className="flex-1 text-center text-lg font-semibold tracking-wide text-[#f39c2b]">
              Cuentas Cobradas
            </h2>
            <button
              onClick={handleNewClick}
              title="Nuevo cobro"
              className="h-8 w-8 leading-none text-xl text-white border border-white/50 hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>

        <div className="px-6 pt-2">
          <div className="border-t border-slate-300" />
        </div>

        {/* Tabla */}
        <div className="px-4 pb-6 pt-2">
          <div className="overflow-auto border border-slate-400">
            <table className="min-w-full border-collapse text-[14px]">
              <thead ref={menuRef}>
                {/* Totales */}
                <tr className="bg-white">
                  <th className="w-10 border-b border-slate-300"></th>
                  <th className="w-32 border-b border-slate-300"></th>
                  <th className="w-32 border-b border-slate-300"></th>
                  <th className="border-b border-slate-300"></th>
                  <th className="w-60 border-b border-slate-300"></th>

                  <th className="w-40 border border-amber-300 bg-amber-100 px-3 py-2 text-right font-semibold text-amber-700">
                    {qtz.format(totals.conIva)}
                  </th>
                  <th className="w-40 border border-amber-300 bg-amber-50 px-3 py-2 text-right font-semibold text-slate-900">
                    {qtz.format(totals.sinIva)}
                  </th>
                  {/* Col IVA tiene check; aquí solo total monetario del IVA */}
                  <th className="w-40 border border-amber-300 bg-amber-100 px-3 py-2 text-right font-semibold text-amber-700">
                    {qtz.format(totals.iva)}
                  </th>
                  {/* NUEVA Col: Cobro final */}
                  <th className="w-44 border border-amber-300 bg-amber-200 px-3 py-2 text-right font-semibold text-amber-800">
                    {qtz.format(totals.cobroFinal)}
                  </th>
                </tr>

                {/* Encabezados */}
                <tr className="bg-[#e9edf5] text-slate-800">
                  <th className="sticky left-0 top-0 z-20 w-10 border border-slate-300 py-2 bg-[#e9edf5]"></th>
                  <th className="top-0 border border-slate-300 px-3 py-2 text-left font-semibold sticky bg-[#e9edf5]">
                    Fecha de ingreso
                  </th>
                  <th className="top-0 border border-slate-300 px-3 py-2 text-left font-semibold sticky bg-[#e9edf5]">
                    Fecha de cobro
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
                    Iva <span className="text-xs font-normal">(✓ pagado)</span>
                  </th>
                  <th className="top-0 w-44 border border-slate-300 px-3 py-2 text-right font-semibold sticky bg-[#e9edf5]">
                    Cobro final
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Fila de captura */}
                {showForm && (
                  <tr className="bg-white">
                    <td className="sticky left-0 z-10 border border-slate-300 bg-white px-0 text-center">
                      <div className="flex items-center justify-center gap-1 py-1">
                        <button
                          title="Guardar"
                          onClick={handleFormSave}
                          className="h-7 w-7 border border-slate-400 hover:bg-slate-100"
                        >
                          ✓
                        </button>
                        <button
                          title="Cancelar"
                          onClick={handleFormCancel}
                          className="h-7 w-7 border border-slate-400 hover:bg-slate-100"
                        >
                          ×
                        </button>
                      </div>
                    </td>

                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        type="text"
                        placeholder="dd/mm/aa"
                        value={form.fecha}
                        onChange={(e) => handleFormChange("fecha", e.target.value)}
                        className="w-full outline-none"
                      />
                    </td>

                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        type="text"
                        placeholder="dd/mm/aa"
                        value={form.fechaCobro}
                        onChange={(e) => handleFormChange("fechaCobro", e.target.value)}
                        className="w-full outline-none"
                      />
                    </td>

                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        type="text"
                        placeholder="Descripción / Concepto"
                        value={form.concepto}
                        onChange={(e) => handleFormChange("concepto", e.target.value)}
                        className="w-full outline-none"
                      />
                    </td>

                    <td className="border border-slate-300 px-2 py-1">
                      <input
                        type="text"
                        placeholder="Categoría"
                        value={form.categoria}
                        onChange={(e) => handleFormChange("categoria", e.target.value)}
                        className="w-full outline-none"
                      />
                    </td>

                    {/* Con IVA */}
                    <td className="border border-amber-300 bg-amber-50 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.conIva}
                        onChange={(e) => handleFormChange("conIva", e.target.value)}
                        className="w-full text-right outline-none"
                      />
                    </td>

                    {/* Sin IVA */}
                    <td className="border border-amber-300 bg-amber-50 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.sinIva}
                        onChange={(e) => handleFormChange("sinIva", e.target.value)}
                        className="w-full text-right outline-none"
                      />
                    </td>

                    {/* IVA + checkbox pagado (solo indicador) */}
                    <td className="border border-amber-300 bg-amber-50 px-2 py-1">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={form.iva}
                          onChange={(e) => handleFormChange("iva", e.target.value)}
                          className="w-28 text-right outline-none"
                        />
                        <input
                          type="checkbox"
                          checked={form.pagado}
                          onChange={(e) => handleFormChange("pagado", e.target.checked)}
                          title="Marcar como pagado"
                          className="h-4 w-4 accent-emerald-600"
                        />
                      </div>
                    </td>

                    {/* Cobro final (muestra; se guarda implícitamente via sinIva) */}
                    <td className="border border-amber-300 bg-amber-100 px-2 py-1 text-right">
                      {(() => {
                        const v = toNum(form.conIva) || fromSinIva(toNum(form.sinIva)).conIva;
                        return qtz.format(v);
                      })()}
                    </td>
                  </tr>
                )}

                {/* Filas de datos */}
                {rows.map((r, idx) => {
                  const isEditing = editRowId === r.id;
                  const iva = toNum(r.sinIva) * IVA_RATE;
                  const conIva = toNum(r.sinIva) + iva;
                  const cobroFinal = conIva; // definición fija

                  return (
                    <tr
                      key={r.id}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#f5fbff]`}
                    >
                      {/* Botón menú / acciones */}
                      <td className="sticky left-0 z-10 border border-slate-300 bg-inherit px-0 text-center relative overflow-visible">
                        {!isEditing ? (
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
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                                onClick={() => handleEdit(r)}
                              >
                                Abono
                              </button>
                              <button
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
                                onClick={() => handleEdit(r)}
                              >
                                Cobrado
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
                        ) : (
                          <div className="flex items-center justify-center gap-1 py-1">
                            <button
                              title="Guardar"
                              onClick={saveEdit}
                              className="h-7 w-7 border border-slate-400 hover:bg-slate-100"
                            >
                              ✓
                            </button>
                            <button
                              title="Cancelar"
                              onClick={cancelEdit}
                              className="h-7 w-7 border border-slate-400 hover:bg-slate-100"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Fecha ingreso */}
                      <td className="whitespace-nowrap border border-slate-300 px-3 py-2 text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDraft.fecha}
                            onChange={(e) => editChange("fecha", e.target.value)}
                            className="w-full outline-none"
                          />
                        ) : (
                          r.fecha
                        )}
                      </td>

                      {/* Fecha cobro */}
                      <td className="whitespace-nowrap border border-slate-300 px-3 py-2 text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDraft.fechaCobro}
                            onChange={(e) => editChange("fechaCobro", e.target.value)}
                            className="w-full outline-none"
                          />
                        ) : (
                          r.fechaCobro
                        )}
                      </td>

                      {/* Concepto */}
                      <td className="border border-slate-300 px-3 py-2 text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDraft.concepto}
                            onChange={(e) => editChange("concepto", e.target.value)}
                            className="w-full outline-none"
                          />
                        ) : (
                          r.concepto
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="border border-slate-300 px-3 py-2 text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDraft.categoria}
                            onChange={(e) => editChange("categoria", e.target.value)}
                            className="w-full outline-none"
                          />
                        ) : (
                          r.categoria
                        )}
                      </td>

                      {/* Con IVA */}
                      <td className="whitespace-nowrap border border-amber-300 bg-amber-50 px-3 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editDraft.conIva}
                            onChange={(e) => editChange("conIva", e.target.value)}
                            className="w-full text-right outline-none"
                          />
                        ) : (
                          qtz.format(conIva)
                        )}
                      </td>

                      {/* Sin IVA */}
                      <td className="whitespace-nowrap border border-amber-300 bg-amber-50 px-3 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editDraft.sinIva}
                            onChange={(e) => editChange("sinIva", e.target.value)}
                            className="w-full text-right outline-none"
                          />
                        ) : (
                          qtz.format(r.sinIva || 0)
                        )}
                      </td>

                      {/* IVA + checkbox pagado */}
                      <td className="whitespace-nowrap border border-amber-300 bg-amber-50 px-3 py-2">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={editDraft.iva}
                              onChange={(e) => editChange("iva", e.target.value)}
                              className="w-28 text-right outline-none"
                            />
                            <input
                              type="checkbox"
                              checked={!!editDraft.pagado}
                              onChange={(e) => editChange("pagado", e.target.checked)}
                              title="Marcar como pagado"
                              className="h-4 w-4 accent-emerald-600"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-right w-28">{qtz.format(iva)}</span>
                            <input
                              type="checkbox"
                              checked={!!r.pagado}
                              onChange={(e) =>
                                setRows((prev) =>
                                  prev.map((x) => (x.id === r.id ? { ...x, pagado: e.target.checked } : x))
                                )
                              }
                              title="Marcar como pagado"
                              className="h-4 w-4 accent-emerald-600"
                            />
                          </div>
                        )}
                      </td>

                      {/* Cobro final (siempre Con IVA) */}
                      <td className="whitespace-nowrap border border-amber-300 bg-amber-100 px-3 py-2 text-right">
                        {qtz.format(cobroFinal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            * Columnas y encabezado fijos, bordes rectos estilo Excel. IVA al {Math.round(IVA_RATE * 100)}%. El checkbox en
            la columna IVA solo indica si la cuenta fue <em>pagada</em>.
          </p>
        </div>
      </div>
    </div>
  );
}
