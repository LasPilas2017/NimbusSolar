export const DeleteProspecto = ({ repo }) => ({
  exec: async (id) => repo.delete(id),
});
