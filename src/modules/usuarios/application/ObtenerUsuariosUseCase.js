// modules/usuarios/application/ObtenerUsuariosUseCase.js
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Caso de uso para obtener la lista completa de usuarios.
// Usado para llenar la tabla en la pantalla de gestión de usuarios.
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: IUsuarioRepository (inyectado).
// - Lo usa: GestionUsuarios.jsx
// -----------------------------------------------------------------------------

export class ObtenerUsuariosUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute() {
    const usuarios = await this.usuarioRepository.listarTodos();
    return usuarios.map((u) => ({
      id: u.id,
      nombreCompleto: u.nombreCompleto,
      alias: u.alias,
      rol: u.rol,
      sistemaAsignado: u.sistemaAsignado,
      estado: u.estado,
    }));
  }
}
