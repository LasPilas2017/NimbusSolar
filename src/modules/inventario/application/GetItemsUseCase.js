// Caso de uso: obtener todos los items

export class GetItemsUseCase {
  constructor(itemRepository) {
    this.itemRepository = itemRepository;
  }
  async execute() {
    return await this.itemRepository.getAll();
  }
}
