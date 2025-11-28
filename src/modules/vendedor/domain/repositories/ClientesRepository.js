// src/modules/vendedor/domain/repositories/ClientesRepository.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Define la "interfaz" (contrato) que cualquier repositorio de clientes debe
// implementar para ser usado en la capa de aplicación del módulo vendedor.
//
// No depende de Supabase ni de ninguna librería externa.
//
// TABLA RELACIONADA (en implementación Supabase):
//   - "clientes"
// -----------------------------------------------------------------------------

export class ClientesRepository {
  /**
   * Debe devolver un arreglo de registros de clientes con al menos:
   * id, nombre_completo, empresa, correo, telefono, celular,
   * departamento, direccion, pais, fecha_creacion
   */
  async getClientes() {
    throw new Error("Método getClientes() no implementado");
  }

  /**
   * Debe crear un nuevo cliente y devolver el registro insertado.
   * @param {object} payload - Campos ya mapeados a snake_case para la BD.
   */
  async createCliente(payload) {
    throw new Error("Metodo createCliente() no implementado");
  }
  /**
   * Debe actualizar un cliente existente y devolver el registro actualizado.
   * @param {string} id - UUID del cliente a actualizar.
   * @param {object} payload - Campos ya mapeados a snake_case para la BD.
   */
  async updateCliente(id, payload) {
    throw new Error("Metodo updateCliente() no implementado");
  }

  /**
   * Debe eliminar un cliente existente.
   * @param {string} id - UUID del cliente a eliminar.
   */
  async deleteCliente(id) {
    throw new Error("Metodo deleteCliente() no implementado");
  }
}
