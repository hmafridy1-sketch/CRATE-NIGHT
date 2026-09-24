import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA65dEiRxa2H6mXP-1FudrxSP7cgollS1o",
  authDomain: "crate-night-eaa55.firebaseapp.com",
  projectId: "crate-night-eaa55",
  storageBucket: "crate-night-eaa55.firebasestorage.app",
  messagingSenderId: "446764185371",
  appId: "1:446764185371:web:e9e1ddeb80b09081fe85be",
  measurementId: "G-BVVM70C1RQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

async function createUserProfile(user, name = "Member") {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email: user.email || "",
    role: "member",
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function createUserWithEmailAndPassword(email, password) {
  const result = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(result.user);
  return result;
}

async function updateProfile(user, profile) {
  await firebaseUpdateProfile(user, profile);
  await createUserProfile(user, profile?.displayName || user.displayName || "Member");
}

export {
  app,
  auth,
  db,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  createUserProfile
};
