// src/modules/vendedor/application/use-cases/createCliente.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Caso de uso para crear un nuevo cliente.
//
// - Usa ClientesRepository (implementado con Supabase).
// - Recibe los datos tal como vienen del formulario de UI.
// - Mapea los campos a snake_case y tipos correctos para la BD.
// - Devuelve el registro insertado (tal como lo regrese el repositorio).
//
// TABLA RELACIONADA (Supabase):
//   - "clientes"
// -----------------------------------------------------------------------------

export function createCreateCliente({ clientesRepository }) {
  return async function createCliente(form) {
    const trimOrNull = (s) => {
      const v = (s ?? "").toString().trim();
      return v === "" ? null : v;
    };

    const payload = {
      nombre_completo: trimOrNull(form.nombreCompleto),
      empresa: trimOrNull(form.empresa),
      // correo es opcional, pero la columna es NOT NULL; guardamos cadena vacía si viene vacío
      correo: trimOrNull(form.correo) ?? "",
      telefono: trimOrNull(form.telefono),
      celular: trimOrNull(form.celular),
      departamento: trimOrNull(form.departamento),
      municipio: trimOrNull(form.municipio),
      direccion: trimOrNull(form.direccion),
      pais: trimOrNull(form.pais) ?? "Guatemala",
      hsp: form.hsp !== "" ? Number(form.hsp) : null,
      fecha_creacion: form.fechaCreacion, // "YYYY-MM-DD"
    };

    const created = await clientesRepository.createCliente(payload);
    return created;
  };
}
