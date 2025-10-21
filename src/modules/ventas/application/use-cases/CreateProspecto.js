import { Prospecto } from "../../domain/entities/Prospecto.js";

// Recibe datos crudos de la UI, crea la Entidad y delega al repo.
export const CreateProspecto = ({ repo }) => {
  return {
    exec: async (payload) => {
      // Validaciones de dominio podrían ir aquí (email obligatorio, etc.)
      const prospecto = new Prospecto(payload);
      const created = await repo.create(prospecto);
      return created;
    }
  };
};
