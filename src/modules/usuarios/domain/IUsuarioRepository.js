// modules/usuarios/domain/IUsuarioRepository.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Define la interfaz (contrato) que debe cumplir cualquier repositorio de usuarios
// del módulo "usuarios". No implementa lógica, solo declara métodos.
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Implementado por: modules/usuarios/infra/UsuarioRepositorySupabase.js
// - Usado por: todos los casos de uso en modules/usuarios/application/*UseCase.js
// -----------------------------------------------------------------------------

export class IUsuarioRepository {
  async crear(usuario) {
    throw new Error("Método crear no implementado");
  }

  async actualizar(usuario) {
    throw new Error("Método actualizar no implementado");
  }

  async buscarPorId(id) {
    throw new Error("Método buscarPorId no implementado");
  }

  async buscarPorAlias(alias) {
    throw new Error("Método buscarPorAlias no implementado");
  }

  async listarTodos() {
    throw new Error("Método listarTodos no implementado");
  }

  async actualizarEstado(id, nuevoEstado) {
    throw new Error("Método actualizarEstado no implementado");
  }

  async actualizarPasswordYFlags(id, passwordHash, requiereCambiarPassword, nuevoEstado) {
    throw new Error("Método actualizarPasswordYFlags no implementado");
  }

  async verificarPassword(usuario, passwordPlano) {
    throw new Error("Método verificarPassword no implementado");
  }
}
