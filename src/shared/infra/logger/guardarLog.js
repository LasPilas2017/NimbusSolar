import { supabase } from '../supabase/supabaseClient';

/**
 * Inserta un log simple en la tabla `logs` (id, usuario, accion, descripcion, created_at)
 * No hace throw si falla para no interrumpir el flujo de la UI.
 */
export async function guardarLog(usuario, accion, descripcion) {
  try {
    const payload = {
      usuario: usuario?.usuario ?? usuario?.email ?? 'desconocido',
      accion,
      descripcion,
    };
    const { error } = await supabase.from('logs').insert(payload);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[Log] No se pudo guardar:', error.message);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[Log] Error inesperado:', err);
  }
}
