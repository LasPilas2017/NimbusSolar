export class User {
  constructor({ id, usuario, nombre, rol, homeTab, allowedTabs }) {
    this.id = id;
    this.usuario = usuario;
    this.nombre = nombre ?? usuario;
    this.rol = rol ?? "user";
    this.homeTab = homeTab ?? "personal";
    this.allowedTabs = Array.isArray(allowedTabs) && allowedTabs.length ? allowedTabs : ["personal"];
  }
}
