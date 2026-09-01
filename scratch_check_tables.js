const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkTables() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Tables/Views exposed in REST API:");
    console.log(Object.keys(data.definitions));
  } catch(e) {
    console.log("Could not fetch swagger docs", e);
  }
}
checkTables();
