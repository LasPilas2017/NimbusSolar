// src/infra/supabase/supabaseClient.js
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Crea y exporta una instancia de cliente Supabase para usarla en la capa infra
// del proyecto (repositories, etc.).
//
// Está preparado para proyectos creados con Create React App (CRA) usando
// variables de entorno con prefijo REACT_APP_.
//
// -----------------------------------------------------------------------------
// VARIABLES DE ENTORNO ESPERADAS
// -----------------------------------------------------------------------------
// En tu archivo .env.development o .env (en la raíz del proyecto) debes tener:
//
//   REACT_APP_SUPABASE_URL=tu_url_de_supabase
//   REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
//
// Después de modificar el .env, siempre tenés que reiniciar el servidor.
// -----------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

// ✅ Para CRA usamos process.env.REACT_APP_*
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabaseClient] Variables REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY no están configuradas.'
  );
}

// Exportamos el cliente si hay config; si no, exportamos null para evitar crasheos
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
