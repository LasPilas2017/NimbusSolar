// src/modules/vendedor/application/use-cases/createCotizacion.js
// Caso de uso: crear una nueva cotización en la tabla cotizaciones_aprobacion
// a partir de los datos que envía <FormMisCotizaciones />.

export class CreateCotizacionUseCase {
  constructor(cotizacionesRepository) {
    this.cotizacionesRepository = cotizacionesRepository;
  }

  async execute(nueva) {
    // conversión segura de números
    const parseOrNull = (val) => {
      if (val === undefined || val === null || val === "") return null;
      const n = Number(String(val).replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    const payload = {
      // campos según tu tabla cotizaciones_aprobacion
      cliente_id: nueva.clienteId,
      sistema_id: nueva.sistemaId || null,
      kwh_dia: parseOrNull(nueva.kwDia),
      kwh_mes: parseOrNull(nueva.promedioKW),
      q_kwh: parseOrNull(nueva.precioKWh),
      estado: (nueva.estado || "pendiente").toLowerCase(),
      // si tienes default en BD lo podrías omitir:
      created_at: new Date().toISOString(),
    };

    await this.cotizacionesRepository.crearCotizacion(payload);
  }
}
