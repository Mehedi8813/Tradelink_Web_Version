const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log("Checking columns in 'users' table...");
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
    } else {
      console.log("No data found in users table. Trying to insert a dummy to see schema errors...");
      const { error: insertError } = await supabase.from('users').insert([{ id: 1 }]);
      console.log("Insert error (can reveal columns):", insertError);
    }
  }

  console.log("\nDeleting any existing admins...");
  const { error: deleteError } = await supabase.from('users').delete().eq('role', 'admin');
  if (deleteError) {
    console.error("Delete Error:", deleteError);
  } else {
    console.log("Successfully deleted any existing admins from Supabase.");
  }
}

checkSchema();
