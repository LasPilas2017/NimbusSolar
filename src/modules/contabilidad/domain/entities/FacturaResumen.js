// src/modules/contabilidad/domain/entities/FacturaResumen.js
// -----------------------------------------------------------------------------
// Entidad de dominio para representar un resumen de factura. Normaliza los
// campos minimos que el resto del dominio necesita sin depender de React ni
// de la capa de infraestructura.
// -----------------------------------------------------------------------------

export function FacturaResumen(raw = {}) {
  return {
    id: raw.id || "",
    cliente: raw.cliente || "N/D",
    total: Number(raw.total || 0),
    estado: raw.estado || "pendiente",
    fecha: raw.fecha || "",
  };
}
