// src/modules/vendedor/domain/repositories/CotizacionesRepository.js
// Define el contrato que debe cumplir cualquier repositorio de cotizaciones
// (Supabase, API REST, mock en memoria, etc.).

export class CotizacionesRepository {
  async getUltimasPorCliente() {
    throw new Error("getUltimasPorCliente() no implementado");
  }

  async crearCotizacion(/* payload */) {
    throw new Error("crearCotizacion() no implementado");
  }
}
