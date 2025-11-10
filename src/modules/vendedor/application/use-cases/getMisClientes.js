// src/modules/vendedor/application/use-cases/getMisClientes.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Caso de uso para obtener la lista de clientes ya normalizada para la UI.
//
// - Usa un ClientesRepository (por ejemplo, el de Supabase).
// - Usa la función de dominio calcularCategoriaCliente.
// - Devuelve objetos listos para pintar en la tabla de "Mis Clientes".
// -----------------------------------------------------------------------------

import { calcularCategoriaCliente } from "../../domain/services/calcularCategoriaCliente.js";

export function createGetMisClientes({ clientesRepository }) {
  // Esta función crea el caso de uso inyectando el repositorio.
  return async function getMisClientes() {
    const registros = await clientesRepository.getClientes();

    // Normalizamos los campos para la UI
    const normalizados = (registros || []).map((r) => ({
      id: r.id,
      nombre_completo: r?.nombre_completo || "---",
      empresa: r?.empresa || "---",
      correo: r?.correo || "---",
      telefono: r?.telefono || "",
      celular: r?.celular || "",
      departamento: r?.departamento || "---",
      direccion: r?.direccion || "---",
      pais: r?.pais || "---",
      categoria: calcularCategoriaCliente(r?.fecha_creacion), // derivado
    }));

    return normalizados;
  };
}
