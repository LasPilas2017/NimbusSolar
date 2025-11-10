// LoginUsuarioUseCase.js
// -----------------------------------------------------------------------------
// qué hace:
//   implementa el caso de uso "login de usuario": recibe alias + contraseña,
//   valida estado (pendiente, activo, bloqueado) y devuelve los datos básicos
//   del usuario para que la UI sepa a qué sistema redirigir (admin, ventas, etc.).
// con qué se conecta:
//   - usa: IUserRepository (inyectado en el constructor)
//   - usa: UserStates (para validar estado)
//   - lo usará: Login.jsx en presentation/pages/Login
// -----------------------------------------------------------------------------

import { UserStates } from "../../../domain/user/UserStates.js";

export class LoginUsuarioUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ alias, passwordPlain }) {
    const user = await this.userRepository.findByAlias(alias);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.estado === UserStates.BLOQUEADO) {
      throw new Error("Usuario bloqueado. Consulte con el administrador.");
    }

    if (user.estado === UserStates.PENDIENTE) {
      throw new Error(
        "Usuario pendiente de activación. Debe crear una nueva contraseña."
      );
    }

    const passwordValida = await this.userRepository.verifyPassword(
      user,
      passwordPlain
    );

    if (!passwordValida) {
      throw new Error("Contraseña incorrecta");
    }

    user.fechaUltimoLogin = new Date().toISOString();
    await this.userRepository.update(user);

    return {
      id: user.id,
      alias: user.alias,
      nombreCompleto: user.nombreCompleto,
      rol: user.rol,
      sistemaAsignado: user.sistemaAsignado,
    };
  }
}
