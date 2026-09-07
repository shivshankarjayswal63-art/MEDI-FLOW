import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOwr5TgIHH-_K1jkTdvnCUQxjP-Z2dsyA",
  authDomain: "shiva-health-app.firebaseapp.com",
  projectId: "shiva-health-app",
  storageBucket: "shiva-health-app.firebasestorage.app",
  messagingSenderId: "81668430596",
  appId: "1:81668430596:web:08ab7696691adfe9078e51",
  measurementId: "G-9H8PDSGHYZ",
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
export default app;
