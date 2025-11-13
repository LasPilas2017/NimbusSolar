// src/modules/vendedor/application/use-cases/createCotizacion.js
// -----------------------------------------------------------------------------
// Caso de uso "CreateCotizacionUseCase" del SISTEMA DEL VENDEDOR.
//
// Recibe desde <Cotizaciones /> un objeto simple (nueva) con:
//   clienteId, cliente, codigoCliente, sistemaId, fecha, estado,
//   vendedor_id, vendedor_nombre, kwDia, promedioKW, precioKWh.
//
// Mapea eso al formato de la tabla public.cotizaciones_aprobacion y llama
// al repositorio (CotizacionesSupabaseRepository.createCotizacion).
// -----------------------------------------------------------------------------

export class CreateCotizacionUseCase {
  constructor(cotizacionesRepository) {
    this.cotizacionesRepository = cotizacionesRepository;
  }

  async execute(input) {
    console.log("[UseCase] INPUT recibido en CreateCotizacionUseCase:", input);

    if (!input || !input.clienteId) {
      throw new Error("CreateCotizacionUseCase: clienteId es requerido.");
    }

    // Conversión segura de números (acepta comas o puntos)
    const parseNum = (v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(String(v).replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    const payload = {
      // Relaciones
      cliente_id: input.clienteId,
      sistema_id: input.sistemaId || null,

      // Datos básicos
      codigo: input.codigoCliente || null,
      estado: input.estado || "solicitadas",
      fecha: input.fecha || null,

      // Consumos / cálculos
      kw_dia: parseNum(input.kwDia),
      kwh_mes: parseNum(input.promedioKW),
      q_kwh: parseNum(input.precioKWh),

      // Vendedor responsable (NO se tocan, solo se pasan tal como vienen)
      vendedor_id:
        input.vendedor_id != null ? String(input.vendedor_id) : null,
      vendedor_nombre:
        input.vendedor_nombre ??
        input.vendedorNombre ??
        input.vendedor ??
        null,

      // Auxiliares
      items: [],
      monto: 0,
      consumos: {},
      stats: {},
      consumo_stat: {},
    };

    console.log("[UseCase] Payload que se manda al repo:", payload);

    const repo = this.cotizacionesRepository;
    if (!repo) {
      throw new Error("CreateCotizacionUseCase: repositorio no definido.");
    }

    if (typeof repo.createCotizacion === "function") {
      return await repo.createCotizacion(payload);
    }

    if (typeof repo.create === "function") {
      return await repo.create(payload);
    }

    throw new Error(
      "CreateCotizacionUseCase: el repositorio no tiene createCotizacion() ni create()."
    );
  }
}
