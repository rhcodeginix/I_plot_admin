import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBYBlPd_oLkYrare86yTzsIqhUJO1ZlIrw",
  authDomain: "l-plot.firebaseapp.com",
  projectId: "l-plot",
  storageBucket: "l-plot.firebasestorage.app",
  messagingSenderId: "629346971068",
  appId: "1:629346971068:web:8d0b8033278bdb329b4fb9",
  measurementId: "G-17B0ZFTZZ4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage();

export { app };
export { auth };
export { db };
