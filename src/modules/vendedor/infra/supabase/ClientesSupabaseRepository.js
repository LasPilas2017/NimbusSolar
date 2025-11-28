// src/modules/vendedor/infra/supabase/ClientesSupabaseRepository.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Implementación concreta de ClientesRepository usando Supabase.
//
// - BASE DE DATOS: Supabase
// - TABLA: "clientes"
// - CAMPOS CONSULTADOS (getClientes):
//   id, nombre_completo, empresa, correo, telefono, celular,
//   departamento, direccion, pais, fecha_creacion
// - CAMPOS INSERTADOS (createCliente): ver mapeo en createCliente.js
// -----------------------------------------------------------------------------

import { ClientesRepository } from "../../domain/repositories/ClientesRepository.js";

export class ClientesSupabaseRepository extends ClientesRepository {
  constructor(supabaseClient) {
    super();
    this.supabase = supabaseClient;
  }

  async getClientes() {
    const { data, error } = await this.supabase
      .from("clientes")
      .select(
        "id, nombre_completo, empresa, correo, telefono, celular, departamento, direccion, pais, fecha_creacion"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createCliente(payload) {
    const { data, error } = await this.supabase
      .from("clientes")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateCliente(id, payload) {
    const { data, error } = await this.supabase
      .from("clientes")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteCliente(id) {
    const { error } = await this.supabase.from("clientes").delete().eq("id", id);
    if (error) {
      throw error;
    }
    return true;
  }
}
