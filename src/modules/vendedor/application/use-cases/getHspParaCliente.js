// src/modules/vendedor/application/use-cases/getHspParaCliente.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Caso de uso (Use Case) para obtener el valor de HSP de un cliente
// según su departamento y la fecha de creación (para identificar el mes).
//
// - Requiere un repositorio que implemente HspResumenRepository.
// - Usa la tabla "hsp_resumen" de Supabase.
// -----------------------------------------------------------------------------

export function createGetHspParaCliente({ hspResumenRepository }) {
  return async function getHspParaCliente({ departamento, fechaCreacion }) {
    if (!departamento) return null;

    const date = fechaCreacion ? new Date(fechaCreacion) : new Date();
    const monthIndex = date.getMonth(); // enero = 0, diciembre = 11

    return await hspResumenRepository.getHspByDepartamentoAndMonth({
      departamento,
      monthIndex,
    });
  };
}
