// modules/usuarios/ui/pages/PrimerIngreso.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE COMPONENTE
// -----------------------------------------------------------------------------
// Pantalla de "Primer ingreso" para usuarios que:
//
//   - fueron creados por el administrador, o
//   - tienen la contraseña reiniciada.
//
// Flujo:
//   1. El usuario escribe su *alias* y el *código* que recibió por SMS.
//   2. Elige una nueva contraseña (y la confirma).
//   3. El componente llama al caso de uso ActivarUsuarioPrimerIngresoUseCase.
//   4. Si todo va bien, muestra un mensaje de éxito y puede redirigir al login.
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: UsuarioRepositorySupabase (infraestructura)
// - Usa: ActivarUsuarioPrimerIngresoUseCase (application)
// - Se mostrará desde el flujo de login (por ejemplo, un botón "Primer ingreso").
// -----------------------------------------------------------------------------

import React, { useMemo, useState } from "react";
import { UsuarioRepositorySupabase } from "../../../usuarios/infra/UsuarioRepositorySupabase";
import { ActivarUsuarioPrimerIngresoUseCase } from "../../../usuarios/application/ActivarUsuarioPrimerIngresoUseCase";

export default function PrimerIngreso({ onVolverAlLogin }) {
  // ---------------------------------------------------------------------------
  // Casos de uso
  // ---------------------------------------------------------------------------
  const repo = useMemo(() => new UsuarioRepositorySupabase(), []);
  const activarUC = useMemo(
    () => new ActivarUsuarioPrimerIngresoUseCase(repo),
    [repo]
  );

  // ---------------------------------------------------------------------------
  // Estado local del formulario
  // ---------------------------------------------------------------------------
  const [alias, setAlias] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // ---------------------------------------------------------------------------
  // Manejo de submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!alias.trim() || !codigo.trim()) {
      setError("Alias y código son obligatorios.");
      return;
    }

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      await activarUC.execute({
        alias: alias.trim(),
        codigoActivacion: codigo.trim(),
        password,
      });

      setMensaje(
        "Cuenta activada correctamente. Ya puedes iniciar sesión con tu alias y contraseña."
      );
      setAlias("");
      setCodigo("");
      setPassword("");
      setPassword2("");
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo activar la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">
          Primer ingreso a Nimbus Solar
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Ingresa tu <strong>alias</strong>, el <strong>código</strong> que recibiste por SMS
          y define tu nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Alias</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej: EoFloresG98"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Código de activación
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código de 6 dígitos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nueva contraseña
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repite la contraseña"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {cargando ? "Activando..." : "Activar cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={onVolverAlLogin}
          className="w-full text-sm text-gray-500 hover:text-gray-800 mt-2"
        >
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
