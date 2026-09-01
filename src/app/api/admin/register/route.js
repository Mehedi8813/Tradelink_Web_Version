import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin
if (!getApps().length) {
  try {
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
  } catch (error) {
    console.error("Firebase Admin Initialization Error", error.stack);
  }
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const auth = getAuth();

    // Since Firebase Auth is ONLY being used for the Admin in this architecture,
    // we simply check if ANY users exist in Firebase Auth.
    const listUsersResult = await auth.listUsers(1);
    
    if (listUsersResult.users.length > 0) {
      return NextResponse.json(
        { error: "An admin is already registered. Only one admin is allowed." },
        { status: 403 }
      );
    }

    // Create the admin user securely via the Admin SDK
    const userRecord = await auth.createUser({
      email: email,
      password: password,
    });

    return NextResponse.json(
      { message: "Admin registered successfully!", uid: userRecord.uid },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create admin account" },
      { status: 500 }
    );
  }
}
