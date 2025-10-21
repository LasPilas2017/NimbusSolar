// Traduce entre "filas" de la BD y la Entidad de Dominio.
import { Prospecto } from "../../domain/entities/Prospecto.js";

// Convierte una fila de la tabla `prospectos` a Entidad
export const toEntity = (row) =>
  new Prospecto({
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    estado: row.estado,
  });

// Convierte una Entidad a formato "fila" para insertar/actualizar en la BD
export const toRow = (entity) => ({
  id: entity.id,            // si usas autoincrement en la BD, puedes omitirlo en insert
  nombre: entity.nombre,
  email: entity.email,
  telefono: entity.telefono,
  estado: entity.estado,
});
