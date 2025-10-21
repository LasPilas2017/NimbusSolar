import { createClient } from '@supabase/supabase-js';

// Usa variables con prefijo REACT_APP_ (CRA)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;          // p.ej. https://koaozymugtdawdlvhixt.supabase.co
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;     // la anon public, largota

let client = null;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Faltan REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY.');
} else {
  client = createClient(supabaseUrl, supabaseKey);
}

export default client; // import supabase from '../supabase';
