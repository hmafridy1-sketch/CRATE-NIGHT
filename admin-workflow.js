import { auth, db } from './firebase.js';
import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

// UI helper: backend authorization MUST still be enforced by Firestore Rules/custom claims.
export async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? snap.data() : null;
}

export function watchApplications(callback) {
  const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export async function updateApplicationStatus(applicationId, status, reviewNote = '') {
  if (!applicationId) throw new Error('Application ID is required.');
  const allowed = ['pending', 'approved', 'rejected'];
  if (!allowed.includes(status)) throw new Error('Invalid application status.');
  await updateDoc(doc(db, 'applications', applicationId), {
    status,
    reviewNote,
    reviewedAt: serverTimestamp(),
    reviewedBy: auth.currentUser?.uid || null
  });
}
