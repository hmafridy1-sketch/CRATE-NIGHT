import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
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
const googleProvider = new GoogleAuthProvider();

let phoneConfirmationResult = null;
let phoneRecaptchaVerifier = null;

async function createUserProfile(user, name = "Member") {
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    // Allow a newly registered member's chosen name to replace the temporary fallback only.
    if (name !== "Member" && existing.data().name === "Member") {
      await setDoc(ref, { name, email: user.email || "", updatedAt: serverTimestamp() }, { merge: true });
    }
    return;
  }

  await setDoc(ref, {
    uid: user.uid,
    name,
    email: user.email || "",
    phone: user.phoneNumber || "",
    role: "member",
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

async function ensureUserProfile(user) {
  await createUserProfile(user, user.displayName || "Member");
}

async function createUserWithEmailAndPassword(email, password, name = "Member") {
  const result = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(result.user, name);
  return result;
}

async function signInWithGoogle() {
  return signInWithRedirect(auth, googleProvider);
}

async function completeGoogleRedirect() {
  return getRedirectResult(auth);
}

function createPhoneRecaptcha(containerId = "phone-recaptcha") {
  if (phoneRecaptchaVerifier) return phoneRecaptchaVerifier;
  phoneRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  return phoneRecaptchaVerifier;
}

async function startPhoneSignIn(phoneNumber, containerId = "phone-recaptcha") {
  const verifier = createPhoneRecaptcha(containerId);
  phoneConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return phoneConfirmationResult;
}

async function confirmPhoneCode(code) {
  if (!phoneConfirmationResult) throw new Error("Start phone verification first.");
  const result = await phoneConfirmationResult.confirm(code);
  await createUserProfile(result.user, result.user.displayName || "Member");
  return result;
}

function clearPhoneRecaptcha() {
  if (phoneRecaptchaVerifier) {
    phoneRecaptchaVerifier.clear();
    phoneRecaptchaVerifier = null;
  }
  phoneConfirmationResult = null;
}

async function updateProfile(user, profile) {
  await firebaseUpdateProfile(user, profile);
  const updates = { updatedAt: serverTimestamp() };
  if (profile?.displayName !== undefined) updates.name = profile.displayName;
  if (user.email) updates.email = user.email;
  await setDoc(doc(db, "users", user.uid), updates, { merge: true });
}

export {
  app, auth, db, storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
  createUserProfile, ensureUserProfile,
  signInWithGoogle, completeGoogleRedirect,
  startPhoneSignIn, confirmPhoneCode, clearPhoneRecaptcha
};
