import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyD6dPPz-ndDZMjU2w6ARg3d7gdAL4Cu7Ls",
  authDomain: "todo-7fefa.firebaseapp.com",
  projectId: "todo-7fefa",
  storageBucket: "todo-7fefa.firebasestorage.app",
  messagingSenderId: "219649418194",
  appId: "1:219649418194:web:1e066269efab10dedd1e0b",
  measurementId: "G-4J69CY3Z1N"
}

const app = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()

export function onAuthReady(cb) {
  return onAuthStateChanged(auth, cb)
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function signInAsGuest() {
  return signInAnonymously(auth)
}

export function signOut() {
  return firebaseSignOut(auth)
}
