const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("XATO: .env faylda SUPABASE_URL yoki SUPABASE_SERVICE_KEY kiritilmagan!");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

module.exports = supabase;
