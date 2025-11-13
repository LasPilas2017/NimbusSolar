// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// CRA expone variables que empiezan con REACT_APP_
const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Faltan REACT_APP_SUPABASE_URL o REACT_APP_SUPABASE_ANON_KEY en .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
