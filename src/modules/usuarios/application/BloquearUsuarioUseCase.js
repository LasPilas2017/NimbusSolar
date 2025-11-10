// modules/usuarios/application/BloquearUsuarioUseCase.js
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Caso de uso para BLOQUEAR un usuario (sin eliminarlo).  
// Cambia el estado a "BLOQUEADO". El usuario ya no puede iniciar sesión.
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: IUsuarioRepository
// - Usa: entidad Usuario (método bloquear)
// - Lo usa: GestionUsuarios.jsx
// -----------------------------------------------------------------------------

export class BloquearUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioId }) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    usuario.bloquear();
    const actualizado = await this.usuarioRepository.actualizar(usuario);

    return {
      id: actualizado.id,
      estado: actualizado.estado,
    };
  }
}
