// src/modules/auth/application/LoginUseCase.js
// -----------------------------------------------------------------------------
// QUÉ HACE
// -----------------------------------------------------------------------------
// Orquesta el login usando el SqlAuthRepository:
//
//   - Recibe usuario/alias, password y flag de "recordar".
//   - Llama a authRepository.login(...).
//   - Devuelve el usuario normalizado para que App.jsx lo procese.
//
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// - Usa: SqlAuthRepository (infra)
// - Lo usan: Login.jsx, App.jsx (indirectamente vía onLogin)
// -----------------------------------------------------------------------------

export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(aliasOUsuario, password, recordar) {
    const user = await this.authRepository.login(
      aliasOUsuario,
      password,
      recordar
    );
    return user;
  }
}
