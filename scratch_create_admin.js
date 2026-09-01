const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APPID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = "astaroth2077@gmail.com";
  const password = "123456Ab";
  let firebaseUid = null;

  console.log("1. Creating Firebase Authentication user...");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUid = userCredential.user.uid;
    console.log(`✅ Firebase User created! UID: ${firebaseUid}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("⚠️ Firebase User already exists.");
    } else {
      console.error("❌ Error creating Firebase User:", error.message);
      process.exit(1);
    }
  }

  console.log("\n2. Creating Supabase Database record...");
  try {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    // We try inserting to the 'users' table
    const { data, error } = await supabase.from('users').insert([{
      role: 'admin',
      full_name: 'System Admin',
      business_name: 'TradeLink HQ',
      password_hash: passwordHash, 
      // Supabase uses phone_number as unique in your current design for others, 
      // but for admin we can just set an arbitrary one or leave it null if schema allows.
      phone_number: 'admin-email-auth' 
    }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint
        console.log("⚠️ Supabase record might already exist (Unique constraint).");
      } else {
        console.error("❌ Error creating Supabase record:", error);
      }
    } else {
      console.log("✅ Supabase User record created!");
    }

  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
  
  console.log("\nDone! You can now log in with the new admin account.");
  process.exit(0);
}

createAdmin();
