import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osnhftjsormgodsabdbn.supabase.co';
const supabaseKey = 'sb_publishable_bvnSN_9uLtF61yHTXCfQug_1bTOY77l';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking users table...");
  const { data, error } = await supabase.from('users').select('*').limit(5);
  console.log("users Error:", error);
  console.log("users Data:", data);
  
  console.log("Checking auth users via auth API...");
  // Normally we can't query auth.users from client without service role, but let's check custom users table first.
}
test();
