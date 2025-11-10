// modules/usuarios/application/ReiniciarPasswordUseCase.js
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Caso de uso para que el ADMIN reinicie la contraseña de un usuario.
// No asigna una nueva contraseña, sino que:
//   - borra la contraseña anterior,
//   - vuelve el estado a PENDIENTE,
//   - genera un nuevo código de activación.
//
// Luego el usuario deberá entrar a la pantalla de "PrimerIngreso" para
// definir su nueva contraseña.
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: IUsuarioRepository
// - Usa: Usuario (método reiniciarPasswordDesdeAdmin)
// - Lo usa: GestionUsuarios.jsx
// -----------------------------------------------------------------------------

export class ReiniciarPasswordUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioId }) {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    usuario.reiniciarPasswordDesdeAdmin();

    const actualizado = await this.usuarioRepository.actualizar(usuario);

    return {
      id: actualizado.id,
      estado: actualizado.estado,
      codigoActivacion: actualizado.codigoActivacion,
    };
  }
}
