// src/modules/vendedor/infra/supabase/CotizacionesSupabaseRepository.js
// -----------------------------------------------------------------------------
// Repositorio de acceso a datos para COTIZACIONES del SISTEMA DEL VENDEDOR.
//
// - Inserta nuevas cotizaciones en la tabla public.cotizaciones_aprobacion
//   (incluyendo vendedor_id y vendedor_nombre tal como vienen en el payload).
// - NO modifica ni intenta completar esos campos; eso ya lo hace la capa
//   superior (Cotizaciones.jsx + CreateCotizacionUseCase).
// - Lee la vista v_cotizaciones_ultima_por_cliente.
// ----------------------------------------------------------------------------- 

export class CotizacionesSupabaseRepository {
  /**
   * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient
   */
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  // ---------------------------------------------------------------------------
  // LECTURA: obtener últimas cotizaciones (vista)
  // ---------------------------------------------------------------------------
  async getUltimasCotizaciones() {
  const { data, error } = await this.supabase
    .from("v_cotizaciones_ultima_por_cliente")
    .select("*")
    .order("fecha", { ascending: false });  // o created_at si lo tienes

  if (error) {
    console.error("ERROR getUltimasCotizaciones:", error.message || error);
    throw error;
  }

  console.log("getUltimasCotizaciones :: rows =>", data); // 👀 debug

  return data ?? [];
}


  // Alias corto
  async getUltimas() {
    return this.getUltimasCotizaciones();
  }

  // ---------------------------------------------------------------------------
  // ESCRITURA: crea una nueva cotización (CREATE)
  //
  // payload YA VIENE LISTO desde CreateCotizacionUseCase:
  //   {
  //     cliente_id,
  //     sistema_id,
  //     codigo,
  //     estado,
  //     fecha,
  //     kw_dia,
  //     kwh_mes,
  //     q_kwh,
  //     vendedor_id,      // ya armado arriba
  //     vendedor_nombre   // ya armado arriba
  //   }
  // ---------------------------------------------------------------------------
  async createCotizacion(payload) {
    console.log("📌 [Repo] createCotizacion – payload recibido:", payload);

    const { data, error } = await this.supabase
      .from("cotizaciones_aprobacion")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(
        "❌ [Repo] ERROR en createCotizacion:",
        error.message || error
      );
      throw new Error(
        `Error al insertar cotización: ${error.message || "Desconocido"}`
      );
    }

    console.log("✅ [Repo] Cotización creada en BD:", data);
    return data;
  }

  // Alias genérico por compatibilidad
  async create(payload) {
    return this.createCotizacion(payload);
  }
}
