export class GetRowMetaUseCase {
  constructor(repo){ this.repo = repo; }
  async execute(id){ return await this.repo.getRowMeta(id); }
}
