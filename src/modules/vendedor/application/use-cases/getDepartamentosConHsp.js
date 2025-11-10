// src/modules/vendedor/application/use-cases/getDepartamentosConHsp.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Caso de uso para obtener la lista de departamentos que tienen registro
// en la tabla "hsp_resumen".
//
// Usa un HspResumenRepository (por ejemplo, HspResumenSupabaseRepository).
// -----------------------------------------------------------------------------

export function createGetDepartamentosConHsp({ hspResumenRepository }) {
  return async function getDepartamentosConHsp() {
    return await hspResumenRepository.getDepartamentos();
  };
}
