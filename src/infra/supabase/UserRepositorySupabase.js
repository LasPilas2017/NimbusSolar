// UserRepositorySupabase.js
// -----------------------------------------------------------------------------
// qué hace:
//   implementación concreta de IUserRepository usando supabase como base de datos.
//   se encarga de leer/escribir en la tabla "usuarios" y mapear filas a entidades
//   User del dominio.
// con qué se conecta:
//   - usa: supabaseClient.js
//   - usa: entidad User y UserStates
//   - implementa: IUserRepository
//   - es usado por: todos los casos de uso de application/user/usecases/*
// -----------------------------------------------------------------------------

import { supabase } from "./supabaseClient";
import { IUserRepository } from "../../domain/user/IUserRepository";
import { User } from "../../domain/user/User";
import { UserStates } from "../../domain/user/UserStates";

export class UserRepositorySupabase extends IUserRepository {
  constructor() {
    super();
    this.tableName = "usuarios"; // nombre de la tabla en supabase
  }

  // convierte una fila de supabase a entidad User
  mapRowToUser(row) {
    if (!row) return null;

    return new User({
      id: row.id,
      nombreCompleto: row.nombre_completo,
      alias: row.alias,
      rol: row.rol,
      sistemaAsignado: row.sistema_asignado,
      estado: row.estado,
      passwordHash: row.password_hash,
      codigoActivacion: row.codigo_activacion,
      requiereCambiarPassword: row.requiere_cambiar_password,
      fechaCreacion: row.fecha_creacion,
      fechaUltimoLogin: row.fecha_ultimo_login,
    });
  }

  async findByAlias(alias) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("alias", alias)
      .maybeSingle();

    if (error) {
      console.error("error findByAlias:", error);
      throw new Error("Error al buscar usuario por alias");
    }

    return this.mapRowToUser(data);
  }

  async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("error findById:", error);
      throw new Error("Error al buscar usuario por id");
    }

    return this.mapRowToUser(data);
  }

  async create(user) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        nombre_completo: user.nombreCompleto,
        alias: user.alias,
        rol: user.rol,
        sistema_asignado: user.sistemaAsignado,
        estado: user.estado,
        password_hash: user.passwordHash,
        codigo_activacion: user.codigoActivacion,
        requiere_cambiar_password: user.requiereCambiarPassword,
        fecha_creacion: user.fechaCreacion,
      })
      .select("*")
      .single();

    if (error) {
      console.error("error create usuario:", error);
      throw new Error("Error al crear usuario");
    }

    return this.mapRowToUser(data);
  }

  async update(user) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        nombre_completo: user.nombreCompleto,
        alias: user.alias,
        rol: user.rol,
        sistema_asignado: user.sistemaAsignado,
        estado: user.estado,
        password_hash: user.passwordHash,
        codigo_activacion: user.codigoActivacion,
        requiere_cambiar_password: user.requiereCambiarPassword,
        fecha_ultimo_login: user.fechaUltimoLogin,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      console.error("error update usuario:", error);
      throw new Error("Error al actualizar usuario");
    }

    return this.mapRowToUser(data);
  }

  async updateState(id, newState) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ estado: newState })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("error updateState usuario:", error);
      throw new Error("Error al actualizar estado de usuario");
    }

    return this.mapRowToUser(data);
  }

  async updatePasswordAndFlags(id, passwordHash, requiereCambiarPassword, newState) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        password_hash: passwordHash,
        requiere_cambiar_password: requiereCambiarPassword,
        estado: newState,
        codigo_activacion: null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("error updatePasswordAndFlags usuario:", error);
      throw new Error("Error al actualizar contraseña de usuario");
    }

    return this.mapRowToUser(data);
  }

  async listAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .order("nombre_completo", { ascending: true });

    if (error) {
      console.error("error listAll usuarios:", error);
      throw new Error("Error al listar usuarios");
    }

    return data.map((row) => this.mapRowToUser(row));
  }

  // verificación simple de contraseña:
  // aquí por ahora se compara texto plano, pero más adelante podés cambiarlo
  // para usar bcrypt u otro sistema de hashing.
  async verifyPassword(user, passwordPlain) {
    // ojo: esto es solo mientras probamos. luego se debe usar hash seguro.
    return user.passwordHash === passwordPlain;
  }
}
