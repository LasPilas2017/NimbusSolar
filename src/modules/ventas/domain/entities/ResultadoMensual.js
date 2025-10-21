// src/modules/ventas/domain/entities/ResultadoMensual.js
export class ResultadoMensual {
  constructor({ mes, prospectos, cierres, ventas }) {
    this.mes = mes;
    this.prospectos = prospectos;
    this.cierres = cierres;
    this.ventas = ventas;
  }
}
