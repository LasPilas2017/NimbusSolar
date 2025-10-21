// src/shared/infra/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const url  = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Creamos el cliente solo si hay ENV válidas
let client = null;
if (!url || !anon) {
  console.warn('[Supabase] Faltan REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY.');
} else {
  client = createClient(url, anon);
}

// Guard para evitar llamadas cuando no hay cliente
export const getSupabase = () => {
  if (!client) {
    throw new Error('Supabase no está inicializado (faltan variables REACT_APP_).');
  }
  return client;
};

// Export por conveniencia (named) y default
export const supabase = client;
export default client;
