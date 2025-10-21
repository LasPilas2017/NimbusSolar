export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(usuario, contrasena, recordar = true) {
    const data = await this.authRepository.login(usuario, contrasena);

    if (recordar) {
      localStorage.setItem('sesionUsuario', JSON.stringify(data));
    }

    return data;
  }
}
