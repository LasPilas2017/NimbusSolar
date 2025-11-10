// IUserRepository.js
// -----------------------------------------------------------------------------
// qué hace:
//   define el "contrato" que debe cumplir cualquier repositorio de usuarios.
//   no tiene implementación, solo declara los métodos necesarios.
// con qué se conecta:
//   - implementado por: infra/supabase/UserRepositorySupabase.js
//   - usado por: todos los casos de uso en application/user/usecases/*
// -----------------------------------------------------------------------------

export class IUserRepository {
  async findByAlias(alias) {
    throw new Error("Método findByAlias no implementado");
  }

  async findById(id) {
    throw new Error("Método findById no implementado");
  }

  async create(user) {
    throw new Error("Método create no implementado");
  }

  async update(user) {
    throw new Error("Método update no implementado");
  }

  async updateState(id, newState) {
    throw new Error("Método updateState no implementado");
  }

  async updatePasswordAndFlags(id, passwordHash, requiereCambiarPassword, newState) {
    throw new Error("Método updatePasswordAndFlags no implementado");
  }

  async listAll() {
    throw new Error("Método listAll no implementado");
  }

  // verificación de contraseña (la implementación decide cómo comparar)
  async verifyPassword(user, passwordPlain) {
    throw new Error("Método verifyPassword no implementado");
  }
}
