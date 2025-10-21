export class Prospecto {
  constructor({
    id, fecha, nombre, empresa, correo, telefono, celular, direccion,
    departamento, municipio, segmento, tipoInstalacion,
    promedioKW, promedioQ, dias, estado, compras, ventasHistorial = [],
    contactos = []
  }) {
    this.id = id;
    this.fecha = fecha;
    this.nombre = nombre;
    this.empresa = empresa ?? "";
    this.correo = correo ?? "";
    this.telefono = telefono ?? "";
    this.celular = celular ?? "";
    this.direccion = direccion ?? "";
    this.departamento = departamento ?? "";
    this.municipio = municipio ?? "";
    this.segmento = segmento ?? "";
    this.tipoInstalacion = tipoInstalacion ?? "";
    this.promedioKW = promedioKW ?? null;
    this.promedioQ  = promedioQ ?? null;
    this.dias       = dias ?? null;
    this.estado     = estado ?? "Por Iniciar";
    this.compras    = compras ?? 0;
    this.ventasHistorial = ventasHistorial;
    this.contactos = contactos;
  }
}
