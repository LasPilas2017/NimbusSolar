// modules/usuarios/application/CrearUsuarioUseCase.js
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Caso de uso para que el ADMIN cree un nuevo usuario:
//   - genera alias automático,
//   - genera código de activación,
//   - guarda teléfono si se proporciona,
//   - deja al usuario en estado PENDIENTE (sin contraseña).
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: Usuario (domain)
// - Usa: IUsuarioRepository (inyectado en el constructor)
// - Lo usa: página GestionUsuarios.jsx
// -----------------------------------------------------------------------------

import { Usuario } from "../domain/Usuario";

export class CrearUsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ nombreCompleto, rol, sistemaAsignado, telefono }) {
    // 👆 Ahora SÍ recibimos "telefono" como parte del input

    const usuario = Usuario.crearDesdeAdmin({
      nombreCompleto,
      rol,
      sistemaAsignado,
      telefono, // 👈 se pasa al dominio
    });

    const guardado = await this.usuarioRepository.crear(usuario);

    return {
      id: guardado.id,
      nombreCompleto: guardado.nombreCompleto,
      alias: guardado.alias,
      rol: guardado.rol,
      sistemaAsignado: guardado.sistemaAsignado,
      estado: guardado.estado,
      codigoActivacion: guardado.codigoActivacion,
      telefono: guardado.telefono, // 👈 se devuelve para usarlo en el SMS
    };
  }
}
