// UserStates.js
// -----------------------------------------------------------------------------
// qué hace:
//   define los estados posibles de un usuario: pendiente, activo o bloqueado.
// con qué se conecta:
//   - usado por: domain/user/User.js (para controlar lógica interna)
//   - usado por casos de uso: LoginUsuario, ActivarUsuario, BloquearUsuario, etc.
// -----------------------------------------------------------------------------

export const UserStates = Object.freeze({
  PENDIENTE: "PENDIENTE", // creado pero sin contraseña activa
  ACTIVO: "ACTIVO",       // puede iniciar sesión normalmente
  BLOQUEADO: "BLOQUEADO", // no puede entrar, pero sus datos se conservan
});
