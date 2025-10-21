// Orquesta la obtención desde el repositorio (que se inyectará).
export const GetProspectos = ({ repo }) => {
  return {
    exec: async () => {
      // Aquí puedes aplicar reglas del negocio (filtros/orden)
      const list = await repo.getAll();
      return list;
    }
  };
};
