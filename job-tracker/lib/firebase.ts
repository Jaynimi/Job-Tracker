// // lib/firebase.ts
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIIa0j8IsCXu8AfJTzpe80j63Muw3aeQ4",
  authDomain: "almost-employed.firebaseapp.com",
  projectId: "almost-employed",
  storageBucket: "almost-employed.firebasestorage.app",
  messagingSenderId: "508932253051",
  appId: "1:508932253051:web:fdf27331c732f546a5c9de",
  measurementId: "G-XMTZ4P824P"
};

// // Initialize Firebase
// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// const db = getFirestore(app);

// export { db };

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);