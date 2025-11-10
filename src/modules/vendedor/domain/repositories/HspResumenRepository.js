// src/modules/vendedor/domain/repositories/HspResumenRepository.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Contrato para acceder al resumen de HSP (Horas Solar Pico) por departamento.
//
// Implementaciones concretas (como Supabase) deben manejar detalles de cómo
// se guarda el arreglo hsp_meses, JSON, etc.
// -----------------------------------------------------------------------------

export class HspResumenRepository {
  /**
   * Debe devolver una lista de nombres de departamento (strings únicos).
   */
  async getDepartamentos() {
    throw new Error("Método getDepartamentos() no implementado");
  }

  /**
   * Debe devolver el valor de HSP para un departamento y mes específicos.
   * @param {object} params
   * @param {string} params.departamento
   * @param {number} params.monthIndex - 0 = enero, 11 = diciembre.
   * @returns {number|null}
   */
  async getHspByDepartamentoAndMonth({ departamento, monthIndex }) {
    throw new Error("Método getHspByDepartamentoAndMonth() no implementado");
  }
}
