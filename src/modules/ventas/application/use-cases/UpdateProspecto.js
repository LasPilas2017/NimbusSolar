export const UpdateProspecto = ({ repo }) => ({
  exec: async (id, partial) => repo.update(id, partial),
});
