// src/modules/ventas/infra/http/ResultadosHttpRepository.js
import { ResultadosRepository } from "../../domain/repositories/ResultadosRepository";
import { ResultadoMensual } from "../../domain/entities/ResultadoMensual";

export class ResultadosHttpRepository extends ResultadosRepository {
  constructor(httpClient) {
    super();
    this.http = httpClient; // opcional (fetch/axios/supabase)
  }

  async obtenerResultados(userId) {
    // TODO: conectar a tu API; por ahora demo:
    const demo = [
      { mes: "Enero", prospectos: 12, cierres: 4, ventas: 23000 },
      { mes: "Febrero", prospectos: 18, cierres: 6, ventas: 32000 },
      { mes: "Marzo", prospectos: 14, cierres: 5, ventas: 29000 },
    ];
    return demo.map((x) => new ResultadoMensual(x));
  }
}
