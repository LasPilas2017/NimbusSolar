// Infraestructura: implementación concreta usando Supabase.
import { ItemRepository } from "../domain/ItemRepository";
import { Item } from "../domain/Item";
import supabase from "../../../supabase"; // <-- ajustá si tu export es distinto

export class SupabaseItemRepository extends ItemRepository {
  async getAll() {
    const { data, error } = await supabase
      .from("inventario")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(row => new Item({
      id: row.id,
      nombre: row.nombre,
      precio_compra: row.precio_compra,
      precio_venta: row.precio_venta,
      disponibles: row.disponibles,
      comentario: row.comentario ?? ""
    }));
  }

  async add(item /* Item */) {
    // Insertar; el ID lo asigna la BD automáticamente
    const insertPayload = {
      nombre: item.nombre,
      precio_compra: item.precio_compra,
      precio_venta: item.precio_venta,
      disponibles: item.disponibles,
      comentario: item.comentario
    };

    const { data, error } = await supabase
      .from("inventario")
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    return new Item({
      id: data.id,
      nombre: data.nombre,
      precio_compra: data.precio_compra,
      precio_venta: data.precio_venta,
      disponibles: data.disponibles,
      comentario: data.comentario ?? ""
    });
  }

  async update(id, partial) {
    const allowed = ["nombre", "precio_compra", "precio_venta", "disponibles", "comentario"];
    const updatePayload = {};
    for (const k of allowed) {
      if (partial[k] !== undefined) updatePayload[k] = partial[k];
    }

    const { data, error } = await supabase
      .from("inventario")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return new Item({
      id: data.id,
      nombre: data.nombre,
      precio_compra: data.precio_compra,
      precio_venta: data.precio_venta,
      disponibles: data.disponibles,
      comentario: data.comentario ?? ""
    });
  }
}
