// src/modules/contabilidad/domain/entities/CuentaPorCobrarResumen.js
// -----------------------------------------------------------------------------
// Entidad de dominio para representar una cuenta por cobrar en formato ligero.
// Se asegura que los campos basicos esten presentes y tipados de forma simple,
// sin depender de React ni de servicios externos.
// -----------------------------------------------------------------------------

export function CuentaPorCobrarResumen(raw = {}) {
  return {
    id: raw.id || "",
    cliente: raw.cliente || "N/D",
    saldo: Number(raw.saldo || 0),
    vencimiento: raw.vencimiento || "",
    estado: raw.estado || "pendiente",
  };
}
