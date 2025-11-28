// src/modules/vendedor/application/use-cases/deleteCliente.js
// -----------------------------------------------------------------------------
// Caso de uso para eliminar un cliente por ID.
// Usa ClientesRepository (implementacion concreta: Supabase).
// -----------------------------------------------------------------------------

export function createDeleteCliente({ clientesRepository }) {
  return async function deleteCliente(id) {
    if (!id) {
      throw new Error("deleteCliente requiere un id");
    }
    await clientesRepository.deleteCliente(id);
    return true;
  };
}
