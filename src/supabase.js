// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// CRA: solo se exponen variables que INICIAN con REACT_APP_
const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

let client = null;
if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Faltan REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY.');
} else {
  client = createClient(supabaseUrl, supabaseKey);
}

export default client;
