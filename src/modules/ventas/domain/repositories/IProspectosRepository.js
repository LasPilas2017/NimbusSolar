export class IProspectosRepository {
  /** @returns {Promise<{rows: any[], total: number}>} */
  async list({ page = 1, pageSize = 50, q = "", filters = {} }) { throw new Error("not impl"); }
  /** @returns {Promise<any>} */
  async getById(id) { throw new Error("not impl"); }
  /** @returns {Promise<void>} */
  async addContacto(id, contacto /* Contacto */) { throw new Error("not impl"); }
  /** @returns {Promise<void>} */
  async updateMeta(id, meta /* { estado?, venta? } */) { throw new Error("not impl"); }
}
