import { db, auth } from './firebase.js';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

export async function submitApplication(data = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in first.');
  const ref = await addDoc(collection(db, 'applications'), {
    applicantUid: user.uid,
    applicantEmail: user.email || '',
    name: data.name || user.displayName || 'Member',
    phone: data.phone || '',
    purpose: data.purpose || '',
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export function watchMyApplications(callback) {
  const user = auth.currentUser;
  if (!user) return () => {};
  const q = query(collection(db, 'applications'), where('applicantUid', '==', user.uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function watchPendingApplications(callback, onError = console.error) {
  const q = query(collection(db, 'applications'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
}

export async function reviewApplication(applicationId, status, reviewNote = '') {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in first.');
  if (!['approved', 'rejected'].includes(status)) throw new Error('Invalid application status.');
  // Client-side guard improves feedback; Firestore Rules enforce actual permissions.
  const token = await user.getIdTokenResult();
  if (token.claims.admin !== true) throw new Error('Administrator access is required.');
  await updateDoc(doc(db, 'applications', applicationId), {
    status,
    reviewNote: String(reviewNote).slice(0, 1000),
    reviewedBy: user.uid,
    updatedAt: serverTimestamp()
  });
}
