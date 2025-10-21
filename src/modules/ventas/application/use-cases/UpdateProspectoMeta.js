export const UpdateProspectoMetaUseCase = (repo) => async (id, meta) => {
  return repo.updateMeta(id, meta);
};
