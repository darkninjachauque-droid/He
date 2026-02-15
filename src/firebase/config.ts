
'use client';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBso-PWibFZmgxAAH26DQxUinlBjjD5p-g",
  authDomain: "heliotech-arquivo-seguro.netlify.app", // Atualizado para o seu domínio do Netlify
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-9995869127-3ea67",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-9995869127-3ea67.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "714918776457",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:714918776457:web:a5a0b7cb26dcbd368e8058"
};
