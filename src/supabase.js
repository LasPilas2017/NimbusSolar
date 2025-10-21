// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// Variables de entorno (CRA exige prefijo REACT_APP_)
const url  = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Inicializamos el cliente solo si existen las variables
let client = null;
if (!url || !anon) {
  console.warn('[Supabase] Faltan variables de entorno: REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY.');
} else {
  client = createClient(url, anon);
}

// Exportación principal (default) y nombrada (supabase)
export const supabase = client;
export default client;

// Función de seguridad para evitar romper la app si falta el cliente
export const getSupabase = () => {
  if (!client) {
    throw new Error('Supabase no está inicializado. Verifica tus variables REACT_APP_.');
  }
  return client;
};
