import React, { useEffect, useState } from "react";

const GTQ = (n) =>
  "Q" + Number(n || 0).toLocaleString("es-GT", { maximumFractionDigits: 0 });

export default function TablaTrabajosGeneral({
  filas = [],
  onGuardarFila, // opcional: (filaActualizada, index) => void | Promise<void>
}) {
  const [rows, setRows] = useState(() => filas.map((f) => ({ ...f })));
  const [editingIndex, setEditingIndex] = useState(null);
  const [backupRow, setBackupRow] = useState(null);

  useEffect(() => {
    if (editingIndex === null) setRows(filas.map((f) => ({ ...f })));
  }, [filas, editingIndex]);

  const handleEditar = (idx) => {
    setBackupRow({ ...rows[idx] });
    setEditingIndex(idx);
  };

  const handleCancelar = () => {
    if (editingIndex !== null && backupRow) {
      setRows((prev) => {
        const next = [...prev];
        next[editingIndex] = { ...backupRow };
        return next;
      });
    }
    setEditingIndex(null);
    setBackupRow(null);
  };

  const handleGuardar = async () => {
    const idx = editingIndex;
    if (idx === null) return;
    const filaActualizada = rows[idx];
    try {
      if (typeof onGuardarFila === "function") {
        await onGuardarFila(filaActualizada, idx);
      }
      setEditingIndex(null);
      setBackupRow(null);
    } catch (e) {
      console.error("Error al guardar fila:", e);
    }
  };

  const handleChange = (idx, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const parsed =
        field === "cantidad" || field === "precioUnitario"
          ? value === ""
            ? ""
            : Math.max(0, Number(value))
          : value;
      next[idx] = { ...next[idx], [field]: parsed };
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="text-slate-600 text-sm">
            <th className="text-left bg-slate-50 px-4 py-3 font-semibold rounded-tl-2xl border border-slate-200">
              Trabajo
            </th>
            <th className="text-center bg-slate-50 px-4 py-3 font-semibold border border-slate-200">
              Cantidad
            </th>
            <th className="text-center bg-slate-50 px-4 py-3 font-semibold border border-slate-200">
              Precio unitario
            </th>
            <th className="text-right bg-slate-50 px-4 py-3 font-semibold border border-slate-200 whitespace-nowrap">
              Total
            </th>
            {/* Columna acciones: lo mínimo necesario */}
            <th
              className="text-center bg-slate-50 px-3 py-3 font-semibold rounded-tr-2xl border border-slate-200 whitespace-nowrap"
              style={{ width: "1%" }}
            >
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="text-sm">
          {rows.map((f, idx) => {
            const isEditing = editingIndex === idx;
            const totalFila =
              Number(f.cantidad || 0) * Number(f.precioUnitario || 0);

            return (
              <tr key={idx} className="border-t border-slate-200">
                {/* Trabajo (no editable) */}
                <td className="px-4 py-3 border-l border-slate-200">
                  {f.trabajo}
                </td>

                {/* Cantidad */}
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="w-24 px-2 py-1 border rounded text-right"
                      value={f.cantidad === "" ? "" : Number(f.cantidad || 0)}
                      onChange={(e) =>
                        handleChange(idx, "cantidad", e.target.value)
                      }
                    />
                  ) : (
                    <span>{Number(f.cantidad || 0)}</span>
                  )}
                </td>

                {/* Precio unitario */}
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-slate-500">Q</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-28 px-2 py-1 border rounded text-right"
                        value={
                          f.precioUnitario === ""
                            ? ""
                            : Number(f.precioUnitario || 0)
                        }
                        onChange={(e) =>
                          handleChange(idx, "precioUnitario", e.target.value)
                        }
                      />
                    </div>
                  ) : (
                    <span>
                      {"Q" +
                        Number(f.precioUnitario || 0).toLocaleString("es-GT")}
                    </span>
                  )}
                </td>

                {/* Total (calculado en vivo) */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {GTQ(totalFila)}
                </td>

                {/* Acciones (auto-anchura, sin ocupar de más) */}
                <td
                  className="px-2 py-2 text-center border-r border-slate-200 whitespace-nowrap"
                  style={{ width: "1%" }}
                >
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => handleEditar(idx)}
                      className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleGuardar}
                        className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelar}
                        className="px-3 py-1.5 text-sm rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
