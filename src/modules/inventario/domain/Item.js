// Entidad de Dominio: Item
// Define el shape y validaciones mínimas de un artículo del inventario.

export class Item {
  constructor({ id = null, nombre, precio_compra, precio_venta, disponibles, comentario = "" }) {
    this.id = id; // uuid (lo genera Supabase)
    this.nombre = String(nombre ?? "").trim();
    this.precio_compra = Number(precio_compra ?? 0);
    this.precio_venta = Number(precio_venta ?? 0);
    this.disponibles = Number.isFinite(disponibles) ? parseInt(disponibles, 10) : 0;
    this.comentario = String(comentario ?? "").trim();

    this._validate();
  }

  _validate() {
    if (!this.nombre) throw new Error("El nombre es obligatorio.");
    if (this.precio_compra < 0) throw new Error("Precio de compra inválido.");
    if (this.precio_venta < 0) throw new Error("Precio de venta inválido.");
    if (!Number.isInteger(this.disponibles) || this.disponibles < 0) {
      throw new Error("Cantidad disponible inválida.");
    }
  }
}
