// Crate Night Jarvis admin authentication guard.
// Firebase Web API keys identify a project; never place service-account secrets here.
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "crate-night-eaa55.firebaseapp.com",
  projectId: "crate-night-eaa55",
  storageBucket: "crate-night-eaa55.firebasestorage.app",
  messagingSenderId: "446764185371",
  appId: "1:446764185371:web:e9e1ddeb80b09081fe85be"
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export function requireAdmin({ onAllowed, onDenied } = {}) {
  return onAuthStateChanged(auth, async user => {
    if (!user) {
      onDenied?.("signed-out");
      if (!location.pathname.endsWith("jarvis-admin-login.html")) location.replace("./jarvis-admin-login.html");
      return;
    }
    try {
      const token = await user.getIdTokenResult(true);
      if (token.claims.admin === true) {
        onAllowed?.(user);
      } else {
        onDenied?.("not-admin");
        await signOut(auth);
        location.replace("./jarvis-admin-login.html?reason=not-admin");
      }
    } catch (error) {
      console.error("Admin verification failed", error);
      onDenied?.("verification-error");
      await signOut(auth);
      location.replace("./jarvis-admin-login.html?reason=verification-error");
    }
  }, error => {
    console.error("Firebase auth state error", error);
    onDenied?.("auth-error");
    location.replace("./jarvis-admin-login.html?reason=auth-error");
  });
}
