export class SaveRowMetaUseCase {
  constructor(repo){ this.repo = repo; }
  async execute(id, meta){ return await this.repo.saveRowMeta(id, meta); }
}
