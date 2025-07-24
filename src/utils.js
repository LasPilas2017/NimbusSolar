import supabase from "./supabase";

export async function guardarLog(usuario, accion, descripcion = "") {

  if (!usuario || (!usuario.nombre && !usuario.usuario)) {
    return;
  }

  try {
   
    await supabase.from("logs").insert({
      usuario: usuario.nombre || usuario.usuario, 
      accion: accion,
      descripcion: descripcion,
    });
  } catch (err) {
    
  }
}
