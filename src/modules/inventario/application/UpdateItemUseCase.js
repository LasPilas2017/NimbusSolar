// Caso de uso: actualizar un item existente

export class UpdateItemUseCase {
  constructor(itemRepository) {
    this.itemRepository = itemRepository;
  }
  async execute(id, partial) {
    return await this.itemRepository.update(id, partial);
  }
}
