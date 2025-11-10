// modules/usuarios/application/ActivarUsuarioPrimerIngresoUseCase.js
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Caso de uso para que el usuario (nuevo o con password reiniciado) active
// su cuenta en el primer ingreso:
//
//   1. Busca al usuario por alias.
//   2. Verifica que esté en estado "PENDIENTE".
//   3. Verifica que el código de activación coincida.
//   4. Guarda la nueva contraseña y pasa el estado a "ACTIVO".
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: IUsuarioRepository (inyectado en el constructor)
// - Usa: entidad de dominio Usuario (método activarConPassword)
// - Lo usará: página PrimerIngreso.jsx
// -----------------------------------------------------------------------------

export class ActivarUsuarioPrimerIngresoUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * Activa la cuenta de un usuario en su primer ingreso.
   *
   * @param {Object} params
   * @param {string} params.alias              Alias del usuario (Ej: EoFloresG98)
   * @param {string} params.codigoActivacion   Código enviado por SMS
   * @param {string} params.password           Nueva contraseña elegida por el usuario
   */
  async execute({ alias, codigoActivacion, password }) {
    // 1. Buscar usuario por alias
    const usuario = await this.usuarioRepository.buscarPorAlias(alias);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // 2. Debe estar en estado PENDIENTE
    if (usuario.estado !== "PENDIENTE") {
      throw new Error("Este usuario ya fue activado o está bloqueado.");
    }

    // 3. Validar código
    if (!usuario.codigoActivacion || usuario.codigoActivacion !== codigoActivacion) {
      throw new Error("Código de activación incorrecto.");
    }

    // 4. Activar con la nueva contraseña
    //    (por ahora la entidad asume que el repositorio se encarga de hashear
    //    o se guarda plano; más adelante se puede mejorar).
    usuario.activarConPassword(password);

    const actualizado = await this.usuarioRepository.actualizar(usuario);

    // 5. Devolvemos un DTO sencillo para la UI
    return {
      id: actualizado.id,
      alias: actualizado.alias,
      nombreCompleto: actualizado.nombreCompleto,
      rol: actualizado.rol,
      sistemaAsignado: actualizado.sistemaAsignado,
      estado: actualizado.estado,
    };
  }
}
