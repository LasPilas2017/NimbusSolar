export class ListProspectosUseCase {
  constructor(repo){ this.repo = repo; }
  async execute(){ return await this.repo.list(); }
}
