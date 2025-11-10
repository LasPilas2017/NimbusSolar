// User.js
// -----------------------------------------------------------------------------
// qué hace:
//   representa la entidad de dominio "Usuario", con todos sus campos y reglas
//   de negocio (estados, activación, bloqueo, reinicio de contraseña, alias, etc.).
// con qué se conecta:
//   - usa: UserRoles, UserStates, UserSystems
//   - es usado por: repositorio (UserRepositorySupabase) y casos de uso
// -----------------------------------------------------------------------------

import { UserRoles } from "./UserRoles";
import { UserStates } from "./UserStates";
import { UserSystems } from "./UserSystems";

export class User {
  constructor(props) {
    this.id = props.id || null;
    this.nombreCompleto = props.nombreCompleto;
    this.alias = props.alias; // ejemplo: EoFloresG98
    this.rol = props.rol || UserRoles.VENDEDOR;
    this.sistemaAsignado = props.sistemaAsignado || UserSystems.VENTAS;
    this.estado = props.estado || UserStates.PENDIENTE;
    this.passwordHash = props.passwordHash || null;
    this.codigoActivacion = props.codigoActivacion || null;
    this.requiereCambiarPassword =
      props.requiereCambiarPassword ?? true; // por defecto true para nuevos usuarios
    this.fechaCreacion = props.fechaCreacion || new Date().toISOString();
    this.fechaUltimoLogin = props.fechaUltimoLogin || null;
  }

  // ---------------------------------------------------------------------------
  // reglas de negocio (métodos del dominio)
  // ---------------------------------------------------------------------------

  bloquear() {
    // si ya está bloqueado no hacemos nada
    if (this.estado === UserStates.BLOQUEADO) return;
    this.estado = UserStates.BLOQUEADO;
  }

  desbloquear() {
    if (this.estado === UserStates.BLOQUEADO) {
      this.estado = UserStates.ACTIVO;
    }
  }

  // crea un usuario nuevo desde admin (sin contraseña inicial)
  static crearNuevoDesdeAdmin({ nombreCompleto, rol, sistemaAsignado }) {
    const alias = User.generarAliasDesdeNombre(nombreCompleto);
    const codigoActivacion = User.generarCodigoActivacion();

    return new User({
      nombreCompleto,
      alias,
      rol,
      sistemaAsignado,
      estado: UserStates.PENDIENTE,
      passwordHash: null,
      requiereCambiarPassword: true,
      codigoActivacion,
    });
  }

  // genera alias tipo "EoFloresG98" a partir del nombre completo
  static generarAliasDesdeNombre(nombreCompleto) {
    if (!nombreCompleto) {
      throw new Error("nombreCompleto es requerido para generar alias");
    }

    const partes = nombreCompleto
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 0) {
      throw new Error("nombreCompleto no tiene partes válidas");
    }

    const primerNombre = partes[0] || "";
    const segundoNombre = partes[1] || "";

    let primerApellido = "";
    let segundoApellido = "";

    if (partes.length >= 3) {
      primerApellido = partes[partes.length - 2];
      segundoApellido = partes[partes.length - 1];
    } else if (partes.length === 2) {
      primerApellido = partes[1];
    } else {
      primerApellido = partes[0];
    }

    const inicialPrimerNombre = primerNombre.charAt(0).toUpperCase();
    const inicialSegundoNombre = segundoNombre
      ? segundoNombre.charAt(0).toLowerCase()
      : "";

    const primerApellidoCapitalizado =
      primerApellido.charAt(0).toUpperCase() +
      primerApellido.slice(1).toLowerCase();

    const inicialSegundoApellido = segundoApellido
      ? segundoApellido.charAt(0).toUpperCase()
      : "";

    // número aleatorio 10-99 para evitar alias repetidos
    const numeroAleatorio = Math.floor(10 + Math.random() * 90);

    const alias = `${inicialPrimerNombre}${inicialSegundoNombre}${primerApellidoCapitalizado}${inicialSegundoApellido}${numeroAleatorio}`;

    return alias;
  }

  // genera código de activación de 6 dígitos
  static generarCodigoActivacion() {
    const numero = Math.floor(100000 + Math.random() * 900000); // 100000-999999
    return String(numero);
  }

  // activar usuario en primer ingreso (o después de reset)
  activarConNuevaPassword(passwordHash) {
    if (!passwordHash) {
      throw new Error("passwordHash es requerido para activar usuario");
    }

    if (this.estado !== UserStates.PENDIENTE) {
      throw new Error(
        "solo se puede activar un usuario que está en estado PENDIENTE"
      );
    }

    this.passwordHash = passwordHash;
    this.estado = UserStates.ACTIVO;
    this.requiereCambiarPassword = false;
    this.codigoActivacion = null; // invalida el código previo
  }

  // reinicio de contraseña solicitado desde admin
  reiniciarPasswordDesdeAdmin() {
    // el usuario vuelve a estado PENDIENTE y se genera nuevo código
    this.passwordHash = null;
    this.estado = UserStates.PENDIENTE;
    this.requiereCambiarPassword = true;
    this.codigoActivacion = User.generarCodigoActivacion();
  }
}
