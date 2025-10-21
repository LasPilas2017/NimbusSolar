import { IProspectosRepository } from "../../domain/repositories/IProspectosRepository";
import { Prospecto } from "../../domain/entities/Prospecto";
import { Contacto } from "../../domain/value-objects/Contacto";

const SEED = [
/* ================ DATA ================= */

  {
    id: "I2025106",
    fecha: "2024-10-02",
    nombre: "ANALÍ ESMERALDA RAMOS DE CHACAT",
    empresa: "CLARO",
    correo: "j.lopez@gmail.com",
    telefono: "8346458111",
    celular: "8119187047",
    direccion: "Gavilanes #222",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Atada a la red",
    promedioKW: 78,
    promedioQ: 350,
    dias: 39,
    estado: "Venta",
    compras: 4000,
  },
  {
    id: "I2025108",
    fecha: "2024-10-02",
    nombre: "JOSÉ MIGUEL REYES RAMÍREZ",
    empresa: "TIGO",
    correo: "ck",
    telefono: "4444",
    celular: "44",
    direccion: "Zona 9",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Atada a la red",
    promedioKW: 54,
    promedioQ: 125,
    dias: 9,
    estado: "Venta",
    compras: 5000,
  },
  {
    id: "I2025110",
    fecha: "2024-10-02",
    nombre: "EDWIN GUSTAVO TZIBOY CHOC",
    empresa: "CABLEADO S.A",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "Guatemala Final",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Atada a la red",
    promedioKW: 375,
    promedioQ: 525,
    dias: 9,
    estado: "Venta",
    compras: 3000,
  },
  {
    id: "I2025112",
    fecha: "2024-10-02",
    nombre: "JOSÉ OSWALDO CHAVAC GARCÍA",
    empresa: "VENTAS TOTALES",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "Zona 0",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Aislada",
    promedioKW: 28,
    promedioQ: 100,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "I2025114",
    fecha: "2024-10-02",
    nombre: "ENGELVER ARIOBALDO GARCIA GARCÍA",
    empresa: "REPUESTOS S.A",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "GUATEMALA",
    municipio: "GUATEMALA",
    segmento: "Industrial",
    tipoInstalacion: "Aislada",
    promedioKW: 28,
    promedioQ: 100,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025106",
    fecha: "2024-10-02",
    nombre: "MARCO TULIO LOPEZ  PEREZ",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025107",
    fecha: "2024-10-02",
    nombre: "LESVER FERNANDO LOPEZ SOC",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "FLORES",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025108",
    fecha: "2024-10-02",
    nombre: "CAROLAY YOMARA SAGASTUME GONZALEZ",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025109",
    fecha: "2024-10-02",
    nombre: "ALFREDO SACUL CHOC",
    empresa: "CASA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025110",
    fecha: "2024-10-02",
    nombre: "JACQUELINE JULISSA CABRERA LOARCA",
    empresa: "CA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "PETEN",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025111",
    fecha: "2024-10-02",
    nombre: "MIRSA CAROLINA GOMEZ HERNANDEZ",
    empresa: "CA",
    correo: "-",
    telefono: "-",
    celular: "-",
    direccion: "-",
    departamento: "FLORES",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025112",
    fecha: "2024-10-02",
    nombre: "JONATHAN ISAIAS IXCOY QUINTANAL",
    empresa: "CA",
    correo: "",
    telefono: "",
    celular: "",
    direccion: "",
    departamento: "ESCUINTLA",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
  {
    id: "D2025113",
    fecha: "2024-10-02",
    nombre: "ESTUARD CANIZALES ALVAREZ",
    empresa: "CASA",
    correo: "",
    telefono: "",
    celular: "",
    direccion: "",
    departamento: "ESCUINTLA",
    municipio: "-",
    segmento: "Domiciliar",
    tipoInstalacion: "Aislada",
    promedioKW: null,
    promedioQ: null,
    dias: null,
    estado: "Por Iniciar",
    compras: 0,
  },
];

function seedContactos(row) {
  const bases = [
    { canal: "WhatsApp", tipo: "Entrante", comentario: "Se compartió brochure y cotización preliminar." },
    { canal: "Llamada",  tipo: "Saliente", comentario: "Pidió detalles de garantía y tiempos." },
    { canal: "Correo",   tipo: "Saliente", comentario: "Se envió propuesta formal con despiece." },
    { canal: "WhatsApp", tipo: "Entrante", comentario: "Confirmó recepción; revisará con gerencia." },
    { canal: "Llamada",  tipo: "Saliente", comentario: "Agendó visita técnica para levantamiento." },
  ];
  const today = new Date();
  return bases.map((b, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (i + ((row.id?.charCodeAt(0) ?? 0) % 3)));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return new Contacto({ fecha: `${y}-${m}-${day}`, canal: b.canal, tipo: b.tipo, comentario: b.comentario });
  });
}

export class ProspectosMemoryRepository extends IProspectosRepository {
  constructor() {
    super();
    this._rows = SEED.map((r) => new Prospecto({ ...r, contactos: seedContactos(r) }));
  }

  async list({ page = 1, pageSize = 50, q = "" }) {
    let rows = this._rows;
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter(r =>
        r.id?.toLowerCase().includes(s) ||
        r.nombre?.toLowerCase().includes(s) ||
        r.empresa?.toLowerCase().includes(s)
      );
    }
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { rows: rows.slice(start, end), total };
  }

  async getById(id) {
    const r = this._rows.find(x => x.id === id);
    if (!r) throw new Error("Prospecto no encontrado");
    return r;
  }

  async addContacto(id, contacto) {
    const p = await this.getById(id);
    p.contactos = [new Contacto(contacto), ...(p.contactos || [])];
  }

  async updateMeta(id, meta = {}) {
    const p = await this.getById(id);
    if (typeof meta.estado !== "undefined") p.estado = meta.estado;
    if (typeof meta.venta  !== "undefined") {
      // si quisieras guardar una marca de venta sencilla:
      // p.venta = meta.venta; // (no usada en la UI actual)
    }
  }
}
