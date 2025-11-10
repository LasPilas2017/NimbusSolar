// src/modules/auth/infra/SqlAuthRepository.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Implementa el repositorio de autenticación para la aplicación:
//
//  - Se conecta a Supabase (tabla "usuarios").
//  - Valida alias/usuario + contraseña usando el hash BCRYPT de la columna
//    "contrasena".
//  - Respeta el campo "estado" del usuario (PENDIENTE, ACTIVO, BLOQUEADO).
//  - Maneja la sesión en localStorage ("sesionUsuario").
// -----------------------------------------------------------------------------

import { supabase } from "../../../infra/supabase/supabaseClient";
import bcrypt from "bcryptjs";

export class SqlAuthRepository {
  // ---------------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------------
  /**
   * Intenta autenticar a un usuario usando su alias/usuario y password.
   *
   * @param {string} aliasOUsuario  Alias o usuario
   * @param {string} password       Contraseña en texto plano
   * @param {boolean} recordar      Si true, guarda la sesión en localStorage
   * @returns {Promise<object>}     Datos normalizados del usuario
   */
  async login(aliasOUsuario, password, recordar = false) {
    if (!aliasOUsuario || !password) {
      throw new Error("Ingresá usuario y contraseña.");
    }

    // 1. Buscar el usuario en la tabla "usuarios"
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .or(`alias.eq.${aliasOUsuario},usuario.eq.${aliasOUsuario}`)
      .maybeSingle();

    if (error) {
      console.error("Error consultando usuarios:", error);
      throw new Error("Error interno al validar usuario.");
    }

    if (!data) {
      throw new Error("Credenciales inválidas.");
    }

    // 2. Revisar estado (PENDIENTE / ACTIVO / BLOQUEADO)
    if (data.estado === "PENDIENTE") {
      throw new Error(
        "Tu cuenta aún no ha sido activada. Usa la pantalla de 'Primer ingreso'."
      );
    }

    if (data.estado === "BLOQUEADO") {
      throw new Error(
        "Tu cuenta está bloqueada. Comunícate con el administrador."
      );
    }

    // 3. Validar contraseña contra el hash BCRYPT de la columna "contrasena"
    if (!data.contrasena) {
      throw new Error("La cuenta no tiene contraseña configurada.");
    }

    const esValida = await bcrypt.compare(password, data.contrasena);

    if (!esValida) {
      throw new Error("Credenciales inválidas.");
    }

    // 4. (Opcional) actualizar fecha_ultimo_login
    try {
      await supabase
        .from("usuarios")
        .update({ fecha_ultimo_login: new Date().toISOString() })
        .eq("id", data.id);
    } catch (e) {
      console.warn("No se pudo actualizar fecha_ultimo_login:", e);
    }

    // 5. Armar objeto de sesión normalizado
    const rol = String(data.rol || "").toLowerCase();

    const baseUser = {
      id: data.id,
      alias: data.alias || data.usuario,
      nombreCompleto: data.nombre,
      rol, // 'admin', 'ventas', etc.
      // en tu tabla actual no tienes "sistema_asignado", pero sí home_tab y allowed_tabs
      sistemaAsignado: null,
      estado: data.estado,
      allowedTabs: Array.isArray(data.allowed_tabs) ? data.allowed_tabs : [],
      homeTab: data.home_tab || null,
    };

    // Guardar sesión local si corresponde
    if (recordar) {
      try {
        localStorage.setItem("sesionUsuario", JSON.stringify(baseUser));
      } catch (e) {
        console.warn("No se pudo guardar la sesión en localStorage:", e);
      }
    }

    return baseUser;
  }

  // ---------------------------------------------------------------------------
  // GET SESSION
  // ---------------------------------------------------------------------------
  async getSession() {
    try {
      const raw = localStorage.getItem("sesionUsuario");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------------------------
  async logout() {
    try {
      localStorage.removeItem("sesionUsuario");
    } catch {
      // ignoramos errores de localStorage
    }
  }
}
