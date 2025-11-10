// DesbloquearUsuarioUseCase.js
// -----------------------------------------------------------------------------
// qué hace:
//   permite que el administrador reactive a un usuario bloqueado, cambiando su
//   estado a ACTIVO (o el que definas).
// con qué se conecta:
//   - usa: IUserRepository
//   - usa: entidad User (método desbloquear)
//   - lo usará: pantalla de administración de usuarios (botón "desbloquear")
// -----------------------------------------------------------------------------

export class DesbloquearUsuarioUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.desbloquear();

    await this.userRepository.update(user);

    return {
      id: user.id,
      estado: user.estado,
    };
  }
}
