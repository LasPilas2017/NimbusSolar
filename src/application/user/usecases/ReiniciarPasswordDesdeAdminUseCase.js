// ReiniciarPasswordDesdeAdminUseCase.js
// -----------------------------------------------------------------------------
// qué hace:
//   caso de uso para que el administrador reinicie la contraseña de un usuario.
//   el usuario vuelve a estado PENDIENTE y se genera un nuevo código de
//   activación. No se eliminan datos, solo se resetea la parte de seguridad.
// con qué se conecta:
//   - usa: IUserRepository
//   - usa: entidad User (método reiniciarPasswordDesdeAdmin)
//   - lo usará: pantalla de administración de usuarios (botón "reiniciar password")
// -----------------------------------------------------------------------------

import { UserStates } from "../../../domain/user/UserStates.js";

export class ReiniciarPasswordDesdeAdminUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.estado === UserStates.BLOQUEADO) {
      throw new Error(
        "No se puede reiniciar la contraseña de un usuario bloqueado."
      );
    }

    user.reiniciarPasswordDesdeAdmin();

    await this.userRepository.update(user);

    return {
      id: user.id,
      alias: user.alias,
      nombreCompleto: user.nombreCompleto,
      estado: user.estado,
      codigoActivacion: user.codigoActivacion,
    };
  }
}
