import React, { useState } from "react";
import THEME from "./theme";

export default function FormProspectos({ onAdd, onClose, defaults = {} }) {
  const [nuevo, setNuevo] = useState({
    fecha: "",
    canal: defaults.canal || "WhatsApp",
    tipo: defaults.tipo || "Entrante",
    comentario: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nuevo.fecha || !nuevo.canal || !nuevo.tipo || !nuevo.comentario) return;

    onAdd?.({ ...nuevo });

    setNuevo({
      fecha: "",
      canal: defaults.canal || "WhatsApp",
      tipo: defaults.tipo || "Entrante",
      comentario: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input
          type="date"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          value={nuevo.fecha}
          onChange={(e) => setNuevo((p) => ({ ...p, fecha: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
        <select
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          value={nuevo.canal}
          onChange={(e) => setNuevo((p) => ({ ...p, canal: e.target.value }))}
          required
        >
          <option>WhatsApp</option><option>Llamada</option>
          <option>Correo</option><option>Visita</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de comunicación</label>
        <select
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          value={nuevo.tipo}
          onChange={(e) => setNuevo((p) => ({ ...p, tipo: e.target.value }))}
          required
        >
          <option>Entrante</option><option>Saliente</option>
        </select>
      </div>
      <div className="md:col-span-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          placeholder="Ej. Cliente solicita comparar inversores…"
          value={nuevo.comentario}
          onChange={(e) => setNuevo((p) => ({ ...p, comentario: e.target.value }))}
          required
        />
      </div>
      <div className="md:col-span-4 flex items-center justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cerrar</button>
        <button type="submit" className="px-4 py-2 rounded-lg text-white" style={{ background: THEME.header }}>
          Agregar Gestión
        </button>
      </div>
    </form>
  );
}
