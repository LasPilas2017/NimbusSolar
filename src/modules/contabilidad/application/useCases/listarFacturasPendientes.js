// src/modules/contabilidad/application/useCases/listarFacturasPendientes.js
// -----------------------------------------------------------------------------
// Caso de uso de ejemplo para obtener facturas pendientes de contabilizar.
// Por ahora devuelve un arreglo mock en memoria. En el futuro invocara la capa
// infra/api y retornara entidades de dominio normalizadas.
// -----------------------------------------------------------------------------

import { FacturaResumen } from "../../domain/entities/FacturaResumen";
import { fetchFacturasPendientes } from "../../infra/api/facturasApiMock";

export async function listarFacturasPendientes() {
  // Llamada simulada a la capa de infraestructura (mock en memoria)
  const data = await fetchFacturasPendientes();

  // Normalizacion a entidades de dominio antes de exponer los datos
  return data.map((item) => FacturaResumen(item));
}
