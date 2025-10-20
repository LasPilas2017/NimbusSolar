import React, { useEffect, useMemo, useState } from "react";
import { Item } from "../domain/Item";
import { SupabaseItemRepository } from "../infra/SupabaseItemRepository";
import { GetItemsUseCase } from "../application/GetItemsUseCase";
import { AddItemUseCase } from "../application/AddItemUseCase";
import { UpdateItemUseCase } from "../application/UpdateItemUseCase";

// Estilos sencillos con Tailwind (ya usás Tailwind en el proyecto)
const inputCls = "w-full rounded-xl border p-2 outline-none focus:ring";
const btn = "rounded-xl px-4 py-2 shadow hover:opacity-90 active:scale-95";
const card = "rounded-2xl bg-white/70 backdrop-blur p-4 shadow";

export default function InventoryPage() {
  // Instanciamos el repositorio una sola vez
  const repo = useMemo(() => new SupabaseItemRepository(), []);
  const getItems = useMemo(() => new GetItemsUseCase(repo), [repo]);
  const addItem = useMemo(() => new AddItemUseCase(repo), [repo]);
  const updateItem = useMemo(() => new UpdateItemUseCase(repo), [repo]);

  // Estado
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Formulario de alta / edición
  const emptyForm = { nombre: "", precio_compra: "", precio_venta: "", disponibles: "", comentario: "" };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // si tiene valor, estamos editando

  // Cargar datos
  const load = async () => {
    try {
      setLoading(true);
      const rows = await getItems.execute();
      setItems(rows);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message ?? "Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Manejo de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Normalizamos números para que no se rompan
    if (["precio_compra", "precio_venta"].includes(name)) {
      setForm(f => ({ ...f, [name]: value.replace(/[^\d.]/g, "") }));
    } else if (name === "disponibles") {
      setForm(f => ({ ...f, [name]: value.replace(/[^\d]/g, "") }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const entity = new Item({
        ...form,
        // Convertimos a número real
        precio_compra: parseFloat(form.precio_compra || "0"),
        precio_venta: parseFloat(form.precio_venta || "0"),
        disponibles: parseInt(form.disponibles || "0", 10)
      });

      if (editingId) {
        // Actualizar
        await updateItem.execute(editingId, {
          nombre: entity.nombre,
          precio_compra: entity.precio_compra,
          precio_venta: entity.precio_venta,
          disponibles: entity.disponibles,
          comentario: entity.comentario
        });
      } else {
        // Agregar nuevo
        await addItem.execute(entity);
      }

      await load();
      resetForm();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message ?? "Error al guardar");
    }
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setForm({
      nombre: it.nombre,
      precio_compra: String(it.precio_compra ?? ""),
      precio_venta: String(it.precio_venta ?? ""),
      disponibles: String(it.disponibles ?? ""),
      comentario: it.comentario ?? ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-emerald-50 to-cyan-50">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Formulario Alta/Edición */}
        <div className={card}>
          <h2 className="mb-4 text-2xl font-semibold">
            {editingId ? "Modificar artículo" : "Agregar artículo"}
          </h2>

          {errorMsg && (
            <div className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm">Nombre del artículo</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} className={inputCls} placeholder="Ej. Taladro, Panel solar..." />
            </div>

            <div>
              <label className="text-sm">Precio de compra</label>
              <input name="precio_compra" value={form.precio_compra} onChange={handleChange} className={inputCls} placeholder="0.00" />
            </div>

            <div>
              <label className="text-sm">Precio de venta</label>
              <input name="precio_venta" value={form.precio_venta} onChange={handleChange} className={inputCls} placeholder="0.00" />
            </div>

            <div>
              <label className="text-sm">No. de artículos disponibles</label>
              <input name="disponibles" value={form.disponibles} onChange={handleChange} className={inputCls} placeholder="0" />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-sm">Comentario</label>
              <textarea name="comentario" value={form.comentario} onChange={handleChange} className={inputCls} rows={2} placeholder="Detalle adicional" />
            </div>

            <div className="col-span-full flex gap-3 pt-2">
              <button type="submit" className={`${btn} bg-emerald-600 text-white`}>
                {editingId ? "Guardar cambios" : "Agregar"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className={`${btn} border`}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla de Inventario */}
        <div className={card}>
          <div className="flex items-center justify-between">
            <h2 className="mb-2 text-2xl font-semibold">Inventario</h2>
            {loading && <span className="text-sm text-gray-500">Cargando...</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Precio compra</th>
                  <th className="p-2 text-left">Precio venta</th>
                  <th className="p-2 text-left">Disponibles</th>
                  <th className="p-2 text-left">Comentario</th>
                  <th className="p-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && !loading && (
                  <tr><td className="p-3 text-gray-500" colSpan={7}>Sin registros todavía.</td></tr>
                )}
                {items.map((it) => (
                  <tr key={it.id} className="odd:bg-white even:bg-gray-50">
                    <td className="p-2 align-top">
                      <span className="inline-block max-w-[180px] truncate align-top" title={it.id}>{it.id}</span>
                    </td>
                    <td className="p-2">{it.nombre}</td>
                    <td className="p-2">Q {Number(it.precio_compra).toFixed(2)}</td>
                    <td className="p-2">Q {Number(it.precio_venta).toFixed(2)}</td>
                    <td className="p-2">{it.disponibles}</td>
                    <td className="p-2">{it.comentario}</td>
                    <td className="p-2">
                      <button onClick={() => startEdit(it)} className={`${btn} border`}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
