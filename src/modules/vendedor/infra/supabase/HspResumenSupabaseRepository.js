// src/modules/vendedor/infra/supabase/HspResumenSupabaseRepository.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Implementación de HspResumenRepository usando Supabase.
//
// - BASE DE DATOS: Supabase
// - TABLA: "hsp_resumen"
// - CAMPOS USADOS:
//   * departamento
//   * hsp_meses  (arreglo/JSON con 12 valores mensuales)
// -----------------------------------------------------------------------------

import { HspResumenRepository } from "../../domain/repositories/HspResumenRepository.js";

export class HspResumenSupabaseRepository extends HspResumenRepository {
  constructor(supabaseClient) {
    super();
    this.supabase = supabaseClient;
  }

  async getDepartamentos() {
    const { data, error } = await this.supabase
      .from("hsp_resumen")
      .select("departamento")
      .order("departamento", { ascending: true });

    if (error) {
      throw error;
    }

    const unicos = Array.from(
      new Set((data ?? []).map((r) => r?.departamento).filter(Boolean))
    );

    return unicos;
  }

  async getHspByDepartamentoAndMonth({ departamento, monthIndex }) {
    const { data, error } = await this.supabase
      .from("hsp_resumen")
      .select("hsp_meses")
      .eq("departamento", departamento)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || data.hsp_meses == null) return null;

    let arr = Array.isArray(data.hsp_meses) ? data.hsp_meses : [];

    if (!Array.isArray(arr)) {
      try {
        arr = JSON.parse(data.hsp_meses);
      } catch {
        arr = [];
      }
    }

    const v = Number(arr?.[monthIndex]);
    return Number.isFinite(v) ? Number(v.toFixed(2)) : null;
  }
}
