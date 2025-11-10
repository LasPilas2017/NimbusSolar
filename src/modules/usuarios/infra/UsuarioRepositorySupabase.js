// modules/usuarios/infra/UsuarioRepositorySupabase.js
// -----------------------------------------------------------------------------
// Implementa IUsuarioRepository usando la tabla EXISTENTE "usuarios" de Supabase.
// Se adapta a tus columnas actuales:
//   - nombre        -> nombreCompleto
//   - usuario       -> alias
//   - contrasena    -> passwordHash (HASH BCRYPT)
//   - home_tab      -> sistemaAsignado (tab/sistema principal)
//   - created_at    -> fechaCreacion
//   - estado, codigo_activacion, requiere_cambiar_password, fecha_ultimo_login
//     que acabamos de agregar por SQL.
// -----------------------------------------------------------------------------

import { supabase } from "../../../infra/supabase/supabaseClient";
import { IUsuarioRepository } from "../domain/IUsuarioRepository";
import { Usuario } from "../domain/Usuario";

export class UsuarioRepositorySupabase extends IUsuarioRepository {
  constructor() {
    super();
    this.tableName = "usuarios";
  }

  mapRowToUsuario(row) {
    if (!row) return null;

    return new Usuario({
      id: row.id,
      nombreCompleto: row.nombre,               // <-- tu columna "nombre"
      alias: row.usuario,                       // <-- tu columna "usuario"
      rol: row.rol,
      sistemaAsignado: row.home_tab || "ventas",
      estado: row.estado || "ACTIVO",
      passwordHash: row.contrasena,            // <-- tu columna "contrasena" (hash)
      codigoActivacion: row.codigo_activacion || null,
      requiereCambiarPassword: row.requiere_cambiar_password ?? false,
      fechaCreacion: row.created_at,
      fechaUltimoLogin: row.fecha_ultimo_login || null,
      telefono: row.telefono,
    });
  }

  async crear(usuario) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        nombre: usuario.nombreCompleto,                  // nombre completo
        usuario: usuario.alias,                          // alias tipo EoFloresG98
        rol: usuario.rol,
        home_tab: usuario.sistemaAsignado,               // ej. "VENTAS", "ADMIN"
        estado: usuario.estado,                          // PENDIENTE, ACTIVO...
        contrasena: usuario.passwordHash,                // normalmente null al crear
        codigo_activacion: usuario.codigoActivacion,
        requiere_cambiar_password: usuario.requiereCambiarPassword,
        telefono: usuario.telefono,  
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error crear usuario:", error);
      throw new Error("Error al crear usuario");
    }

    return this.mapRowToUsuario(data);
  }

  async actualizar(usuario) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        nombre: usuario.nombreCompleto,
        usuario: usuario.alias,
        rol: usuario.rol,
        home_tab: usuario.sistemaAsignado,
        estado: usuario.estado,
        contrasena: usuario.passwordHash,
        codigo_activacion: usuario.codigoActivacion,
        requiere_cambiar_password: usuario.requiereCambiarPassword,
        fecha_ultimo_login: usuario.fechaUltimoLogin,
        telefono: usuario.telefono, 
      })
      .eq("id", usuario.id)
      .select("*")
      .single();

    if (error) {
      console.error("Error actualizar usuario:", error);
      throw new Error("Error al actualizar usuario");
    }

    return this.mapRowToUsuario(data);
  }

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error buscarPorId:", error);
      throw new Error("Error al buscar usuario por id");
    }

    return this.mapRowToUsuario(data);
  }

  async buscarPorAlias(alias) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("usuario", alias)           // alias va en la columna "usuario"
      .maybeSingle();

    if (error) {
      console.error("Error buscarPorAlias:", error);
      throw new Error("Error al buscar usuario por alias");
    }

    return this.mapRowToUsuario(data);
  }

  async listarTodos() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .order("nombre", { ascending: true });   // <-- usamos "nombre", no nombre_completo

    if (error) {
      console.error("Error listarTodos:", error);
      throw new Error("Error al listar usuarios");
    }

    return data.map((row) => this.mapRowToUsuario(row));
  }

  async actualizarEstado(id, nuevoEstado) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ estado: nuevoEstado })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error actualizarEstado:", error);
      throw new Error("Error al actualizar estado de usuario");
    }

    return this.mapRowToUsuario(data);
  }

  async actualizarPasswordYFlags(id, passwordHash, requiereCambiarPassword, nuevoEstado) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        contrasena: passwordHash,
        requiere_cambiar_password: requiereCambiarPassword,
        estado: nuevoEstado,
        codigo_activacion: null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error actualizarPasswordYFlags:", error);
      throw new Error("Error al actualizar contraseña de usuario");
    }

    return this.mapRowToUsuario(data);
  }

  // Por ahora no se usa en los casos de uso de gestión,
  // así que lo dejamos simple. Más adelante se puede usar bcrypt.compare.
  async verificarPassword(usuario, passwordPlano) {
    if (!usuario.passwordHash) return false;
    return usuario.passwordHash === passwordPlano;
  }
}
