import { ProspectosRepository } from "../../domain/repositories/ProspectosRepository";

const LS_PREFIX_HIST = "crm_historial_contactos:";
const LS_PREFIX_META = "crm_row_meta:";

const FAKE_ROWS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  prospecto: `Prospecto ${i + 1}`,
  condicion: i % 2 ? "Nuevo" : "Recurrente",
  agente: ["Ana", "Luis", "Karla"][i % 3],
  canal: ["Facebook", "Llamada", "Email"][i % 3],
  fecha1: "", fecha2: "", fecha3: "", fecha4: "", fecha5: "",
  dias: "", avance: "", estatus: "Por Iniciar", venta: i % 7 === 0,
  notas: i % 3 === 0 ? "Pendiente de llamada de seguimiento." : "",
  historialContactos: []
}));

export class LocalProspectosRepository extends ProspectosRepository {
  async list() {
    // (podrías persistir FAKE_ROWS en LS, por ahora retornamos en memoria)
    return FAKE_ROWS;
  }

  _readLS(key, fallback = []) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  }
  _writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  async addContacto(id, contacto) {
    const k = `${LS_PREFIX_HIST}${id}`;
    const curr = this._readLS(k);
    this._writeLS(k, [contacto, ...curr]);
  }
  async getHistorial(id) {
    const k = `${LS_PREFIX_HIST}${id}`;
    return this._readLS(k);
  }

  async getRowMeta(id) {
    const k = `${LS_PREFIX_META}${id}`;
    return this._readLS(k, null);
  }
  async saveRowMeta(id, meta) {
    const k = `${LS_PREFIX_META}${id}`;
    this._writeLS(k, meta);
  }

  async getKpis() {
    // mock: números fijos
    return {
      baseTotal: 320, enProceso: 0, finalizados: 3,
      frio: 0, tibio: 0, caliente: 0,
      etapasValores: [0,0,0,0,0,0],
      etapasPct:     [100,100,100,100,100,100],
      conversion: { ventasCount: 3, ventasMonto: 12000, perdidasCount: 0, perdidasMonto: 0,
                    conversionPct: 100, cicloVenta: 3.0, perdidosPct: 0, embudoPct: 0, ventaPct: 100 }
    };
  }
}
