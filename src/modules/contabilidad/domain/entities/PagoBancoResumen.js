// src/modules/contabilidad/domain/entities/PagoBancoResumen.js
// -----------------------------------------------------------------------------
// Entidad de dominio para representar un pago bancario en formato resumido.
// Solo contiene campos basicos y permanece independiente de la infraestructura.
// -----------------------------------------------------------------------------

export function PagoBancoResumen(raw = {}) {
  return {
    id: raw.id || "",
    referencia: raw.referencia || "N/D",
    monto: Number(raw.monto || 0),
    banco: raw.banco || "Sin banco",
    fecha: raw.fecha || "",
  };
}
