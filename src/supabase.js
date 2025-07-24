// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://koaozymugtdawdlvhixt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYW96eW11Z3RkYXdkbHZoaXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjQxMTcsImV4cCI6MjA2MzM0MDExN30.nVbAkorgWUEBuHij2P3nMAEyaHB4l_o_-MhFhF5qLZM'
);

export default supabase; // ✅ exportación por defecto
