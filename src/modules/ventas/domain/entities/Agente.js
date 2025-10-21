export class Agente {
  constructor({
    id, nombre, correo, telefono, celular, direccion, ciudad,
    sueldoBase = 0, comision = 0, cierres = 0, efectividad = 0, ventas = 0,
    dpi,
  }) {
    Object.assign(this, {
      id, nombre, correo, telefono, celular, direccion, ciudad,
      sueldoBase, comision, cierres, efectividad, ventas, dpi,
    });
  }
}
