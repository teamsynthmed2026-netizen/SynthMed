// db.js - Supabase JS Client (HTTPS REST — works through any firewall)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl  = process.env.SUPABASE_URL;
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY; // bypasses RLS for backend

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// createClient connects to: process.env.SUPABASE_URL (set in .env)
const supabase = createClient(supabaseUrl, supabaseKey);

// Verify connection on startup
(async () => {
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.error('❌ Supabase error:', error.message);
    console.log('💡 Run schema.sql in Supabase SQL Editor first, then restart.');
  } else {
    console.log('✅ Supabase connected →', supabaseUrl);
  }
})();

module.exports = supabase;
