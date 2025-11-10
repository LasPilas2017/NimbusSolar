export class AddContactoUseCase {
  constructor(repo){ this.repo = repo; }
  async execute(id, contacto){ await this.repo.addContacto(id, contacto); }
}
