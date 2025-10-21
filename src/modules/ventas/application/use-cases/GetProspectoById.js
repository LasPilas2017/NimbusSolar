export const GetProspectoByIdUseCase = (repo) => async (id) => {
  return repo.getById(id);
};
