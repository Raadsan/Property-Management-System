import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCABtxMDGkdB1tY3IeuHTcb_r60_5nlHpw",
  authDomain: "damal-application-e5100.firebaseapp.com",
  projectId: "damal-application-e5100",
  storageBucket: "damal-application-e5100.firebasestorage.app",
  messagingSenderId: "946817119852",
  appId: "1:946817119852:web:5bf22a1ac50e2f3ecd0a49",
  measurementId: "G-2955NHH3ZD"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
