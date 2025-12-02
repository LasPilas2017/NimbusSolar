// src/modules/contabilidad/infra/api/facturasApiMock.js
// -----------------------------------------------------------------------------
// API simulada para el modulo de contabilidad. Retorna arreglos estaticos en
// memoria para facilitar el desarrollo sin depender aun de Supabase u otro
// backend real. Estas funciones imitan llamadas asincronas.
// -----------------------------------------------------------------------------

export async function fetchFacturasPendientes() {
  // Simula latencia de red minima
  return Promise.resolve([
    { id: "FAC-001", cliente: "Cliente Solar", total: 12500, estado: "pendiente", fecha: "2025-01-01" },
    { id: "FAC-002", cliente: "Energia GT", total: 8400, estado: "observada", fecha: "2025-01-03" },
  ]);
}

export async function fetchCuentasPorCobrar() {
  return Promise.resolve([
    { id: "CXC-100", cliente: "Cliente Solar", saldo: 5200, vencimiento: "2025-01-15", estado: "proxima" },
    { id: "CXC-101", cliente: "Comercial Verde", saldo: 3100, vencimiento: "2025-01-02", estado: "vencida" },
  ]);
}

export async function fetchPagosBancarios() {
  return Promise.resolve([
    { id: "PAY-01", referencia: "TRX-123", monto: 2500, banco: "Banco Uno", fecha: "2025-01-04" },
    { id: "PAY-02", referencia: "TRX-456", monto: 4100, banco: "Banco Dos", fecha: "2025-01-05" },
  ]);
}
