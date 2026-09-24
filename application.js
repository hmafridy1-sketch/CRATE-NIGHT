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
    reviewNote: '',
    reviewedBy: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export function watchMyApplications(callback) {
  const user = auth.currentUser;
  if (!user) return () => {};
  const q = query(collection(db, 'applications'), where('applicantUid', '==', user.uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export function watchPendingApplications(callback) {
  const q = query(collection(db, 'applications'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function reviewApplication(applicationId, status, reviewNote = '') {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in first.');
  if (!['approved', 'rejected'].includes(status)) throw new Error('Invalid application status.');
  await updateDoc(doc(db, 'applications', applicationId), {
    status,
    reviewNote,
    reviewedBy: user.uid,
    updatedAt: serverTimestamp()
  });
}
