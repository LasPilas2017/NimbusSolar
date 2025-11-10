// src/modules/vendedor/domain/services/calcularCategoriaCliente.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Función de dominio que calcula la categoría de un cliente ("recientes",
// "frecuentes" o "retirados") en base a su fecha de creación.
// No conoce nada de React ni de Supabase.
// -----------------------------------------------------------------------------

export function calcularCategoriaCliente(fechaStr) {
  if (!fechaStr) return "retirados";

  const hoy = new Date();
  const f = new Date(fechaStr);
  const diffDias = Math.floor((hoy - f) / (1000 * 60 * 60 * 24));

  if (diffDias <= 30) return "recientes";
  if (diffDias <= 90) return "frecuentes";
  return "retirados";
}
