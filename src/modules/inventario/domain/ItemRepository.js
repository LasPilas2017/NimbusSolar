// Puerto (Interfaz) del Repositorio.
// La capa de aplicación dependerá de esta interfaz, NO de Supabase.

export class ItemRepository {
  // Debe devolver Promise<Item[]>
  async getAll() { throw new Error("Not implemented"); }

  // Debe devolver Promise<Item> creado
  async add(item /* Item */) { throw new Error("Not implemented"); }

  // Debe devolver Promise<Item> actualizado
  async update(id, partial /* campos a actualizar */) { throw new Error("Not implemented"); }
}
