// ActivarUsuarioPrimerIngresoUseCase.js
// -----------------------------------------------------------------------------
// qué hace:
//   caso de uso para activar un usuario en su primer ingreso (o después de un
//   reinicio de contraseña). Recibe alias, código de activación y nueva
//   contraseña, valida todo y marca al usuario como ACTIVO.
// con qué se conecta:
//   - usa: IUserRepository
//   - usa: entidad User (método activarConNuevaPassword)
//   - lo usará: pantalla de "primer ingreso / recuperar contraseña" en la UI
// -----------------------------------------------------------------------------

import { UserStates } from "../../../domain/user/UserStates.js";

export class ActivarUsuarioPrimerIngresoUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ alias, codigoActivacion, passwordHash }) {
    const user = await this.userRepository.findByAlias(alias);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.estado !== UserStates.PENDIENTE) {
      throw new Error("Este usuario no está pendiente de activación.");
    }

    if (!user.codigoActivacion || user.codigoActivacion !== codigoActivacion) {
      throw new Error("Código de activación incorrecto.");
    }

    user.activarConNuevaPassword(passwordHash);

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
