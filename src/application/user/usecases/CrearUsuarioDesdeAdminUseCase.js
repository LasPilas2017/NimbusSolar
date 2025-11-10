// CrearUsuarioDesdeAdminUseCase.js
// -----------------------------------------------------------------------------
// qué hace:
//   permite que el administrador cree un nuevo usuario sin contraseña. Se genera
//   alias automático y código de activación. El usuario queda en estado PENDIENTE.
// con qué se conecta:
//   - usa: User (método estático crearNuevoDesdeAdmin)
//   - usa: IUserRepository
//   - lo usará: pantalla de administración de usuarios (AdminUsuarios.jsx)
// -----------------------------------------------------------------------------

import { User } from "../../../domain/user/User.js";

export class CrearUsuarioDesdeAdminUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ nombreCompleto, rol, sistemaAsignado }) {
    const user = User.crearNuevoDesdeAdmin({
      nombreCompleto,
      rol,
      sistemaAsignado,
    });

    const savedUser = await this.userRepository.create(user);

    return {
      id: savedUser.id,
      nombreCompleto: savedUser.nombreCompleto,
      alias: savedUser.alias,
      rol: savedUser.rol,
      sistemaAsignado: savedUser.sistemaAsignado,
      estado: savedUser.estado,
      codigoActivacion: savedUser.codigoActivacion,
    };
  }
}
