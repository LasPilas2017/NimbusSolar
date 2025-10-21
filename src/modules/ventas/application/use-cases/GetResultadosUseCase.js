// src/modules/ventas/application/use-cases/GetResultadosUseCase.js
export class GetResultadosUseCase {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(userId) {
    return await this.repository.obtenerResultados(userId);
  }
}
