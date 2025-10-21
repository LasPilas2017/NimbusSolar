// ✅ Import primero, antes de cualquier export
import { supabase as client } from './shared/infra/supabase/supabaseClient';

// Reexportaciones (default + nombrada)
export { client as supabase };
export default client;
