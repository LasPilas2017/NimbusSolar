// UserRoles.js
// -----------------------------------------------------------------------------
// qué hace:
//   define los roles posibles de un usuario dentro del sistema (jefe empresa,
//   jefe de ventas, vendedor, etc.).
// con qué se conecta:
//   - es importado por: domain/user/User.js
//   - también lo pueden usar casos de uso en application/user/usecases/*
// -----------------------------------------------------------------------------

export const UserRoles = Object.freeze({
  JEFE_EMPRESA: "JEFE_EMPRESA", // dueño / administrador general
  JEFE_VENTAS: "JEFE_VENTAS",   // jefe del sistema de ventas
  VENDEDOR: "VENDEDOR",         // vendedor normal
  // a futuro: CONTADOR, BODEGUERO, TECNICO_ELECTRICISTA, etc.
});
