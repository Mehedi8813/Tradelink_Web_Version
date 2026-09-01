import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

async function checkUsers() {
  const auth = getAuth();
  const listUsersResult = await auth.listUsers(10);
  console.log("Firebase Auth Users:");
  listUsersResult.users.forEach((userRecord) => {
    console.log(`- ${userRecord.email} (uid: ${userRecord.uid})`);
  });
}

checkUsers().catch(console.error);
