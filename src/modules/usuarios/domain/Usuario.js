// modules/usuarios/domain/Usuario.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Representa la entidad de dominio "Usuario" para el módulo de gestión de usuarios.
// Contiene:
//   - todos los campos del usuario,
//   - reglas de negocio (bloquear, desbloquear, activar, reiniciar password),
//   - generación de alias (Ej: "EoFloresG98"),
//   - generación de código de activación.
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usado por los casos de uso en: modules/usuarios/application/*UseCase.js
// - Usado por el repositorio: modules/usuarios/infra/UsuarioRepositorySupabase.js
// - Se guarda en la tabla "usuarios" de Supabase.
// -----------------------------------------------------------------------------

export class Usuario {
  constructor(props) {
    this.id = props.id ?? null;
    this.nombreCompleto = props.nombreCompleto;
    this.alias = props.alias;
    this.rol = props.rol; // ejemplo: 'admin', 'ventas', 'bodega', etc.
    this.sistemaAsignado = props.sistemaAsignado; // ej: 'ADMIN', 'VENTAS'
    this.estado = props.estado ?? "PENDIENTE"; // PENDIENTE | ACTIVO | BLOQUEADO
    this.passwordHash = props.passwordHash ?? null;
    this.codigoActivacion = props.codigoActivacion ?? null;
    this.requiereCambiarPassword = props.requiereCambiarPassword ?? true;
    this.fechaCreacion = props.fechaCreacion ?? new Date().toISOString();
    this.fechaUltimoLogin = props.fechaUltimoLogin ?? null;
    this.telefono = props.telefono ?? null;
  }

  // ------- Reglas de negocio -----------------------------------------------

  bloquear() {
    if (this.estado === "BLOQUEADO") return;
    this.estado = "BLOQUEADO";
  }

  desbloquear() {
    if (this.estado === "BLOQUEADO") {
      this.estado = "ACTIVO";
    }
  }

static crearDesdeAdmin({ nombreCompleto, rol, sistemaAsignado, telefono }) {
  const alias = Usuario.generarAliasDesdeNombre(nombreCompleto);
  const codigoActivacion = Usuario.generarCodigoActivacion();

  return new Usuario({
    nombreCompleto,
    alias,
    rol,
    sistemaAsignado,
    telefono,               
    estado: "PENDIENTE",
    passwordHash: null,
    requiereCambiarPassword: true,
    codigoActivacion,
  });
}


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

    const numeroAleatorio = Math.floor(10 + Math.random() * 90); // 10-99

    return `${inicialPrimerNombre}${inicialSegundoNombre}${primerApellidoCapitalizado}${inicialSegundoApellido}${numeroAleatorio}`;
  }

  static generarCodigoActivacion() {
    const numero = Math.floor(100000 + Math.random() * 900000); // 100000-999999
    return String(numero);
  }

  activarConPassword(passwordHash) {
    if (!passwordHash) throw new Error("passwordHash requerido para activar usuario");

    if (this.estado !== "PENDIENTE") {
      throw new Error("Solo se puede activar un usuario en estado PENDIENTE");
    }

    this.passwordHash = passwordHash;
    this.estado = "ACTIVO";
    this.requiereCambiarPassword = false;
    this.codigoActivacion = null;
  }

  reiniciarPasswordDesdeAdmin() {
    this.passwordHash = null;
    this.estado = "PENDIENTE";
    this.requiereCambiarPassword = true;
    this.codigoActivacion = Usuario.generarCodigoActivacion();
  }
}
