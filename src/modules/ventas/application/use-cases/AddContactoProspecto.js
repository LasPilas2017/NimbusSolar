export const AddContactoProspectoUseCase = (repo) => async (id, contacto) => {
  return repo.addContacto(id, contacto);
};
