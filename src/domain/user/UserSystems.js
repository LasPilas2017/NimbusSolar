// UserSystems.js
// -----------------------------------------------------------------------------
// qué hace:
//   define los "sistemas" o módulos a los que se puede asignar un usuario.
// con qué se conecta:
//   - usado por: domain/user/User.js
//   - usado por casos de uso y por la UI para redirigir (admin, ventas, etc.)
// -----------------------------------------------------------------------------

export const UserSystems = Object.freeze({
  ADMIN: "ADMIN",   // sistema de administración general
  VENTAS: "VENTAS", // sistema de ventas (tu módulo actual)
  // a futuro: CONTABILIDAD, BODEGA, PLANTA, TECNICO, etc.
});
