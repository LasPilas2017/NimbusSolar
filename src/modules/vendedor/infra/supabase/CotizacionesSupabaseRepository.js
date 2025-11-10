// src/modules/vendedor/infra/supabase/CotizacionesSupabaseRepository.js
// -----------------------------------------------------------------------------
// Implementación de CotizacionesRepository usando Supabase.
//
// BASE DE DATOS
//   - Vista (solo lectura): v_cotizaciones_ultima_por_cliente
//   - Tabla (insert):       cotizaciones_aprobacion
// -----------------------------------------------------------------------------

import { CotizacionesRepository } from "../../domain/repositories/CotizacionesRepository.js";

const VIEW_ULTIMAS = "v_cotizaciones_ultima_por_cliente";
const TABLE_BASE = "cotizaciones_aprobacion";

export class CotizacionesSupabaseRepository extends CotizacionesRepository {
  constructor(supabaseClient) {
    super();
    this.supabase = supabaseClient;
  }

  // Devuelve registros crudos de la vista (sin transformar).
  async getUltimasPorCliente() {
    const { data, error } = await this.supabase
      .from(VIEW_ULTIMAS)
      .select(
        "id,codigo,cliente_id,cliente_nombre,sistema_nombre,estado,fecha,created_at"
      )
      .order("fecha", { ascending: false, nullsFirst: false });

    if (error) throw error;
    return data || [];
  }

  // Inserta una nueva cotización en la tabla base.
  async crearCotizacion(payload) {
    const { error } = await this.supabase.from(TABLE_BASE).insert([payload]);
    if (error) throw error;
  }
}
