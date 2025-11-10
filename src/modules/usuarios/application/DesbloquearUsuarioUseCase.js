// modules/usuarios/application/DesbloquearUsuarioUseCase.js
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Caso de uso para DESBLOQUEAR un usuario bloqueado.
// Cambia el estado a "ACTIVO".
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: IUsuarioRepository
// - Usa: Usuario (método desbloquear)
// - Lo usa: GestionUsuarios.jsx
// -----------------------------------------------------------------------------

export class DesbloquearUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioId }) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    usuario.desbloquear();
    const actualizado = await this.usuarioRepository.actualizar(usuario);

    return {
      id: actualizado.id,
      estado: actualizado.estado,
    };
  }
}
