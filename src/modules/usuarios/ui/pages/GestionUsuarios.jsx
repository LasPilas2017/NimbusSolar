// modules/usuarios/ui/pages/GestionUsuarios.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Pantalla de **Gestión de Usuarios** para el ADMIN.
// Permite:
//   - ver la lista de usuarios,
//   - crear un nuevo usuario (nombre completo, rol, sistema, teléfono),
//   - bloquear / desbloquear usuarios,
//   - reiniciar la contraseña (deja al usuario en estado PENDIENTE).
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: UsuarioRepositorySupabase (infra)
// - Usa: casos de uso:
//     * CrearUsuarioUseCase
//     * ObtenerUsuariosUseCase
//     * BloquearUsuarioUseCase
//     * DesbloquearUsuarioUseCase
//     * ReiniciarPasswordUseCase
// - Se debería mostrar solo a usuarios con rol "admin".
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import { UsuarioRepositorySupabase } from "../../../usuarios/infra/UsuarioRepositorySupabase";
import { CrearUsuarioUseCase } from "../../../usuarios/application/CrearUsuarioUseCase";
import { ObtenerUsuariosUseCase } from "../../../usuarios/application/ObtenerUsuariosUseCase";
import { BloquearUsuarioUseCase } from "../../../usuarios/application/BloquearUsuarioUseCase";
import { DesbloquearUsuarioUseCase } from "../../../usuarios/application/DesbloquearUsuarioUseCase";
import { ReiniciarPasswordUseCase } from "../../../usuarios/application/ReiniciarPasswordUseCase";

export default function GestionUsuarios() {
  // ---------------------------------------------------------------------------
  // ESTADOS DE LA VISTA
  // ---------------------------------------------------------------------------
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Campos del formulario de creación de usuario
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [rol, setRol] = useState("ventas");
  const [sistemaAsignado, setSistemaAsignado] = useState("VENTAS");
  // 🔹 Nuevo campo: teléfono del usuario
  const [telefono, setTelefono] = useState("");

  // ---------------------------------------------------------------------------
  // CASOS DE USO Y REPOSITORIO (MEMOIZADOS)
  // ---------------------------------------------------------------------------
  const repo = useMemo(() => new UsuarioRepositorySupabase(), []);
  const crearUC = useMemo(() => new CrearUsuarioUseCase(repo), [repo]);
  const obtenerUC = useMemo(() => new ObtenerUsuariosUseCase(repo), [repo]);
  const bloquearUC = useMemo(() => new BloquearUsuarioUseCase(repo), [repo]);
  const desbloquearUC = useMemo(() => new DesbloquearUsuarioUseCase(repo), [repo]);
  const reiniciarUC = useMemo(() => new ReiniciarPasswordUseCase(repo), [repo]);

  // ---------------------------------------------------------------------------
  // CARGAR LISTA DE USUARIOS
  // ---------------------------------------------------------------------------
  const cargarUsuarios = async () => {
    setCargando(true);
    setError("");
    try {
      const lista = await obtenerUC.execute();
      setUsuarios(lista);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // CREAR NUEVO USUARIO
  // ---------------------------------------------------------------------------
  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      // 🔹 Incluimos el teléfono en el caso de uso
      const nuevo = await crearUC.execute({
        nombreCompleto,
        rol,
        sistemaAsignado,
        telefono,
      });

      // Mensaje para el admin con alias y código de activación
      setMensaje(
        `Usuario creado. Alias: ${nuevo.alias} | Código de activación: ${nuevo.codigoActivacion}`
      );

      // 🔹 Intentamos enviar el código por SMS a través del backend (Supabase Functions)
      try {
        await enviarCodigoPorSMS({
          telefono: nuevo.telefono,
          alias: nuevo.alias,
          codigo: nuevo.codigoActivacion,
        });
      } catch (smsError) {
        // Si falla el SMS, solo lo registramos en consola para no romper el flujo del admin
        console.error("Error enviando SMS:", smsError);
      }

      // Limpiamos campos del formulario
      setNombreCompleto("");
      setTelefono("");
      await cargarUsuarios();
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al crear usuario");
    } finally {
      setCargando(false);
    }
  };

  // ---------------------------------------------------------------------------
  // BLOQUEAR / DESBLOQUEAR / REINICIAR PASSWORD
  // ---------------------------------------------------------------------------
  const handleBloquear = async (id) => {
    setError("");
    setMensaje("");
    try {
      await bloquearUC.execute({ usuarioId: id });
      await cargarUsuarios();
    } catch (e) {
      setError(e.message || "No se pudo bloquear el usuario");
    }
  };

  const handleDesbloquear = async (id) => {
    setError("");
    setMensaje("");
    try {
      await desbloquearUC.execute({ usuarioId: id });
      await cargarUsuarios();
    } catch (e) {
      setError(e.message || "No se pudo desbloquear el usuario");
    }
  };

  const handleReiniciar = async (id) => {
    setError("");
    setMensaje("");
    try {
      const result = await reiniciarUC.execute({ usuarioId: id });
      setMensaje(
        `Password reiniciada. Nuevo código de activación para el usuario: ${result.codigoActivacion}`
      );
      await cargarUsuarios();
    } catch (e) {
      setError(e.message || "No se pudo reiniciar la contraseña");
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Gestión de Usuarios</h1>
      <p className="text-gray-600 mb-4">
        Desde aquí el administrador puede crear usuarios, asignar sistemas y bloquear/desbloquear accesos.
      </p>

      {/* Formulario de creación */}
      <form
        onSubmit={handleCrear}
        className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 items-start md:items-end"
      >
        {/* Nombre completo */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Nombre completo</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="Ej: Erick Ottoniel Flores García"
            required
          />
        </div>

        {/* 🔹 Teléfono */}
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+502 5555 5555"
            required
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="ventas">Ventas</option>
            <option value="bodega">Bodega</option>
            <option value="contabilidad">Contabilidad</option>
            <option value="tecnico">Técnico</option>
          </select>
        </div>

        {/* Sistema asignado */}
        <div>
          <label className="block text-sm font-medium mb-1">Sistema asignado</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={sistemaAsignado}
            onChange={(e) => setSistemaAsignado(e.target.value)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="VENTAS">VENTAS</option>
            {/* Futuro: BODEGA, CONTABILIDAD, etc. */}
          </select>
        </div>

        {/* Botón crear */}
        <button
          type="submit"
          disabled={cargando}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      {mensaje && <div className="text-sm text-green-700">{mensaje}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Alias</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Sistema</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.nombreCompleto}</td>
                <td className="px-3 py-2 font-mono text-xs">{u.alias}</td>
                <td className="px-3 py-2">{u.rol}</td>
                <td className="px-3 py-2">{u.sistemaAsignado}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      u.estado === "ACTIVO"
                        ? "text-green-600 font-medium"
                        : u.estado === "BLOQUEADO"
                        ? "text-red-600 font-medium"
                        : "text-yellow-600 font-medium"
                    }
                  >
                    {u.estado}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  {u.estado !== "BLOQUEADO" ? (
                    <button
                      onClick={() => handleBloquear(u.id)}
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-700"
                    >
                      Bloquear
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDesbloquear(u.id)}
                      className="px-2 py-1 text-xs rounded bg-green-100 text-green-700"
                    >
                      Desbloquear
                    </button>
                  )}

                  <button
                    onClick={() => handleReiniciar(u.id)}
                    className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700"
                  >
                    Reiniciar contraseña
                  </button>
                </td>
              </tr>
            ))}

            {!usuarios.length && !cargando && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// HELPER PARA ENVIAR CÓDIGO POR SMS
// -----------------------------------------------------------------------------
// Esta función ahora muestra el texto completo devuelto por la función Edge
// si ocurre un error, en lugar de lanzar siempre el mismo mensaje genérico.
// -----------------------------------------------------------------------------
async function enviarCodigoPorSMS({ telefono, alias, codigo }) {
  const resp = await fetch(
    "https://koaozymugtdawdlvhixt.functions.supabase.co/enviar-codigo-sms",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.REACT_APP_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ telefono, alias, codigo }),
    }
  );

  // 👇 AQUI está la clave
  if (!resp.ok) {
    const text = await resp.text();
    console.error("Respuesta de la función enviar-codigo-sms:", text);
    throw new Error(text || "No se pudo enviar el SMS");
  }
}


