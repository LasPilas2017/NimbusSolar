// src/modules/vendedor/application/use-cases/updateCliente.js
// -----------------------------------------------------------------------------
// Caso de uso para actualizar un cliente existente.
//
// - Usa ClientesRepository (implementado con Supabase).
// - Recibe los datos tal como vienen del formulario de UI.
// - Mapea los campos a snake_case y tipos correctos para la BD.
// - Devuelve el registro actualizado.
// -----------------------------------------------------------------------------

export function createUpdateCliente({ clientesRepository }) {
  return async function updateCliente(id, form) {
    const trimOrNull = (s) => {
      const v = (s ?? "").toString().trim();
      return v === "" ? null : v;
    };

    const payload = {
      nombre_completo: trimOrNull(form.nombreCompleto),
      empresa: trimOrNull(form.empresa),
      correo: trimOrNull(form.correo),
      telefono: trimOrNull(form.telefono),
      celular: trimOrNull(form.celular),
      departamento: trimOrNull(form.departamento),
      municipio: trimOrNull(form.municipio),
      direccion: trimOrNull(form.direccion),
      pais: trimOrNull(form.pais) ?? "Guatemala",
      hsp: form.hsp !== "" ? Number(form.hsp) : null,
      fecha_creacion: form.fechaCreacion,
    };

    const updated = await clientesRepository.updateCliente(id, payload);
    return updated;
  };
}
