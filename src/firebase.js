// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDGbVAydzb3DT50khR-dfmLOnd7mWhGHaw",
    authDomain: "psych-office-tasks.firebaseapp.com",
    projectId: "psych-office-tasks",
    storageBucket: "psych-office-tasks.firebasestorage.app",
    messagingSenderId: "1021149418235",
    appId: "1:1021149418235:web:6eff366fe2e42afc6d965e",
    measurementId: "G-C819HGCBZY"
  };
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// התחברות אנונימית
const auth = getAuth(app);
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously to Firebase");
  })
  .catch((error) => {
    console.error("Firebase anonymous sign-in error:", error);
  });