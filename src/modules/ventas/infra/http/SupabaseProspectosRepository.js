// Implementación concreta del contrato usando Supabase.
// NO se usa en UI directamente: se inyecta en los casos de uso (application).
import { createClient } from "@supabase/supabase-js";
import { ProspectosRepository } from "../../domain/repositories/ProspectosRepository.js";
import { toEntity, toRow } from "../mappers/prospectos.mapper.js";

export class SupabaseProspectosRepository extends ProspectosRepository {
  constructor({ url, key, table = "prospectos" }) {
    super();
    this.table = table;
    this.sb = createClient(url, key);
  }

  // Lee todos los prospectos (puedes agregar filtros/orden si querés)
  async getAll() {
    const { data, error } = await this.sb
      .from(this.table)
      .select("*")
      .order("id", { ascending: false });

    if (error) throw new Error(`Supabase getAll: ${error.message}`);
    return (data ?? []).map(toEntity);
  }

  // Crea un nuevo prospecto y devuelve la Entidad creada
  async create(entity) {
    const row = toRow(entity);
    // Si tu tabla usa autoincrement en "id", elimina row.id antes de insertar:
    if (row.id == null) delete row.id;

    const { data, error } = await this.sb
      .from(this.table)
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`Supabase create: ${error.message}`);
    return toEntity(data);
  }


async update(id, partial) {
  const { data, error } = await this.sb
    .from(this.table)
    .update(partial)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Supabase update: ${error.message}`);
  return toEntity(data);
}

async delete(id) {
  const { error } = await this.sb
    .from(this.table)
    .delete()
    .eq("id", id);
  if (error) throw new Error(`Supabase delete: ${error.message}`);
  return true;
}

}
