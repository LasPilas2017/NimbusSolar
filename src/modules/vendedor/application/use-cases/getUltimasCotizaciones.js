// src/modules/vendedor/application/use-cases/getUltimasCotizaciones.js
// Caso de uso: obtener la ÚLTIMA cotización por cliente desde la vista
// v_cotizaciones_ultima_por_cliente y normalizarla para la UI.

export class GetUltimasCotizacionesUseCase {
  constructor(cotizacionesRepository) {
    this.cotizacionesRepository = cotizacionesRepository;
  }

  async execute() {
    const data = await this.cotizacionesRepository.getUltimasPorCliente();

    return (data || []).map((r) => ({
      id: r.id,
      codigo: r.codigo,
      cliente_id: r.cliente_id,
      cliente_nombre: r.cliente_nombre || "—",
      sistema_nombre: r.sistema_nombre || "—",
      monto: 0, // por ahora tu vista no trae monto, lo dejamos en 0
      estado: (r.estado || "pendiente").toLowerCase(),
      fecha:
        r.fecha || r.created_at
          ? new Date(r.fecha || r.created_at).toISOString()
          : null,
    }));
  }
}
