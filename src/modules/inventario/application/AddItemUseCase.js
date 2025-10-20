// Caso de uso: agregar nuevo item

export class AddItemUseCase {
  constructor(itemRepository) {
    this.itemRepository = itemRepository;
  }
  async execute(item /* entidad Item */) {
    return await this.itemRepository.add(item);
  }
}
