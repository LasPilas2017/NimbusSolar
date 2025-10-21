export class Contacto {
  constructor({ fecha, canal, tipo, comentario }) {
    this.fecha = fecha;                 // YYYY-MM-DD
    this.canal = canal;                 // WhatsApp | Llamada | Correo | Visita
    this.tipo  = tipo;                  // Entrante | Saliente
    this.comentario = (comentario || "").trim();
  }
}
