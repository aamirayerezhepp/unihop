/* Google sign-in and per-user storage through Firebase. Loaded only on the standalone site, never inside Claude. */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export function createCloud(config){
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return {
    onUser: cb => onAuthStateChanged(auth, cb),
    signIn: () => signInWithPopup(auth, new GoogleAuthProvider()),
    signOut: () => signOut(auth),
    /* One document per student: users/{uid}. Firestore rules let only that student read or write it. */
    load: async uid => { const s = await getDoc(doc(db, 'users', uid)); return s.exists() ? s.data() : null; },
    save: (uid, data) => setDoc(doc(db, 'users', uid), data)
  };
}
