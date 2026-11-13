// Renseigne tes clés dans un fichier .env (VITE_FIREBASE_*). Sans clés, l'app fonctionne en local.
import { initializeApp } from "firebase/app"; import { getAuth } from "firebase/auth"; import { getFirestore } from "firebase/firestore";
const e = (import.meta as any).env || {};
const app = initializeApp({ apiKey: e.VITE_FIREBASE_API_KEY || "x", authDomain: e.VITE_FIREBASE_AUTH_DOMAIN, projectId: e.VITE_FIREBASE_PROJECT_ID || "demo", appId: e.VITE_FIREBASE_APP_ID });
export const auth = getAuth(app); export const db = getFirestore(app);
