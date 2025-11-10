// BloquearUsuarioUseCase.js
// -----------------------------------------------------------------------------
// qué hace:
//   bloquea a un usuario sin eliminarlo. El usuario ya no puede iniciar sesión,
//   pero todas sus ventas, reportes, etc. siguen asociados a su id.
// con qué se conecta:
//   - usa: IUserRepository
//   - usa: entidad User (método bloquear)
//   - lo usará: pantalla de administración de usuarios (botón "bloquear")
// -----------------------------------------------------------------------------

export class BloquearUsuarioUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.bloquear();

    await this.userRepository.update(user);

    return {
      id: user.id,
      estado: user.estado,
    };
  }
}
