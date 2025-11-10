export class GetKpisUseCase {
  constructor(repo){ this.repo = repo; }
  async execute(){ return await this.repo.getKpis(); }
}
