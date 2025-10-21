export class ProspectosRepository {
  async list() { throw new Error("not implemented"); }

  // historial de contactos
  async addContacto(prospectoId, contacto) { throw new Error("not implemented"); }
  async getHistorial(prospectoId) { throw new Error("not implemented"); }

  // meta por fila (estatus, venta Sí/No)
  async getRowMeta(prospectoId) { throw new Error("not implemented"); }
  async saveRowMeta(prospectoId, meta) { throw new Error("not implemented"); }

  // KPIs
  async getKpis() { throw new Error("not implemented"); }
}
