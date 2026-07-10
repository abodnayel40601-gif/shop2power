import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcEqcUKd86mFOXtvN4GwadNySSIHWnqjw",
  authDomain: "shop2power1.firebaseapp.com",
  projectId: "shop2power1",
  storageBucket: "shop2power1.firebasestorage.app",
  messagingSenderId: "471455734332",
  appId: "1:471455734332:web:8951d909fca612dd01c139",
  measurementId: "G-5Y37MYVXSS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Set language to Arabic for the Auth UI flow
auth.languageCode = "ar";

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
};
export type { User };
