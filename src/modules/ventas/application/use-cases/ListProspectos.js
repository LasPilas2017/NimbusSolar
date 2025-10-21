export const ListProspectosUseCase = (repo) => async (params = {}) => {
  return repo.list(params);
};
