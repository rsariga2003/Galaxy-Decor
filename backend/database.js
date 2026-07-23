/**
 * GALAXY DECOR - SUPABASE DATABASE CLIENT INITIALIZATION
 * Connects to Supabase Cloud PostgreSQL via @supabase/supabase-js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

let supabaseUrl = (process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co').trim();
// Strip trailing slashes or /rest/v1 suffix if pasted from Supabase Dashboard endpoint view
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');

const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-supabase-service-role-key-here').trim();

// Check if credentials are using initial placeholder dummy values
const isConfigured = Boolean(
  supabaseUrl && 
  !supabaseUrl.includes('your-project-ref') && 
  supabaseKey && 
  !supabaseKey.includes('your-supabase-')
);

if (isConfigured) {
  console.log('✅ Supabase client initialized successfully!');
  console.log(`🔗 Project URL: ${supabaseUrl}`);
} else {
  console.warn('⚠️ WARNING: Supabase API credentials are using initial placeholder values in backend/.env');
  console.warn('👉 Please update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env with your Supabase credentials.');
}

// Create Supabase Client instance
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

module.exports = {
  supabase,
  isConfigured
};
