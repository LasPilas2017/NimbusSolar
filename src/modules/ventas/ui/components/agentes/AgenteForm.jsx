import React from "react";
import THEME from "../../styles/theme";

export default function AgenteForm({ formData, onChange, onSave, onCancel }) {
  if (!formData) return null;
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSave}>
     {/* Correo */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: THEME.textSecondary }}>
          Correo Electrónico
        </label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={onChange}
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 transition"
          style={{ borderColor: THEME.borderSoft }}
        />
      </div>

      {/* DPI */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: THEME.textSecondary }}>
          DPI
        </label>
        <input
          type="text"
          name="dpi"
          value={formData.dpi}
          onChange={onChange}
          placeholder="###########"
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 transition"
          style={{ borderColor: THEME.borderSoft }}
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: THEME.textSecondary }}>
          Teléfono
        </label>
        <input
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={onChange}
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 transition"
          style={{ borderColor: THEME.borderSoft }}
        />
      </div>

      {/* Ciudad */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: THEME.textSecondary }}>
          Ciudad
        </label>
        <input
          type="text"
          name="ciudad"
          value={formData.ciudad}
          onChange={onChange}
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 transition"
          style={{ borderColor: THEME.borderSoft }}
        />
      </div>

      {/* Dirección */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1" style={{ color: THEME.textSecondary }}>
          Dirección
        </label>
        <textarea
          name="direccion"
          value={formData.direccion}
          onChange={onChange}
          rows={3}
          className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 transition"
          style={{ borderColor: THEME.borderSoft }}
        />
      </div>

      {/* Botones */}
      <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border hover:bg-gray-50 transition"
          style={{ borderColor: THEME.borderSoft, color: THEME.textPrimary }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-white shadow hover:opacity-95 transition"
          style={{ background: THEME.accentBlue }}
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
