// src/infra/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// CRA inyecta solo variables que empiezan con REACT_APP_
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Evitamos inicializar si faltan ENV (así no truena con "supabaseUrl is required")
let supabase = null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Variables de entorno faltantes. Revisa tu .env en la raíz.');
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export { supabase };

// Chequeo opcional
export const checkConnection = async () => {
  if (!supabase) {
    console.error('[Supabase] Cliente no inicializado (faltan envs).');
    return;
  }
  const { error } = await supabase.from('usuarios').select('count').limit(1);
  if (error) console.error('[Supabase] Error al conectar:', error.message);
};
