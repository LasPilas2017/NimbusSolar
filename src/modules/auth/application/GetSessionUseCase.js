export class GetSessionUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    return await this.authRepository.getSession();
  }
}
