import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // No tirar error aquí para que la app no “se caiga” al cargar;
  // solo avisamos en consola (el error aparecerá al primer uso).
  console.warn('[Supabase] Variables de entorno faltantes. Revisa tu archivo .env en la raíz.');
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_KEY ?? '');

// (opcional) test rápido – si te molesta el warning de ESLint, borra “data”
export const checkConnection = async () => {
  const { error } = await supabase.from('usuarios').select('count').limit(1);
  if (error) console.error('[Supabase] Error al conectar:', error.message);
};
