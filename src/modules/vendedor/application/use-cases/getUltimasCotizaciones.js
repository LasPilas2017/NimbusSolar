// src/modules/vendedor/application/use-cases/getUltimasCotizaciones.js
// -----------------------------------------------------------------------------
// Use case: obtener las últimas cotizaciones por cliente para el vendedor.
// Toma todos los campos que necesitamos en la UI, incluyendo vendedor_id
// y vendedor_nombre para poder filtrar por usuario logueado.
// -----------------------------------------------------------------------------

export class GetUltimasCotizacionesUseCase {
  /**
   * @param {import('../../infra/supabase/CotizacionesSupabaseRepository').CotizacionesSupabaseRepository} repo
   */
  constructor(repo) {
    this.repo = repo;
  }

  async execute() {
    const rows = await this.repo.getUltimas();

    console.log("DEBUG getUltimasCotiza :: rows raw =>", rows);

    // 🔥 IMPORTANTE: conservar vendedor_id y vendedor_nombre
    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      cliente_id: r.cliente_id,
      cliente_nombre: r.cliente_nombre,
      sistema_id: r.sistema_id,
      sistema_nombre: r.sistema_nombre,
      monto: r.monto,
      estado: r.estado,
      fecha: r.fecha,

      // 👇 estos eran los que faltaban
      vendedor_id: r.vendedor_id,
      vendedor_nombre: r.vendedor_nombre,
    }));
  }
}
