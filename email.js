import { db, auth } from './firebase.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

export async function queueEmail({to, subject, message}) {
  const user = auth.currentUser;
  if (!user || user.email !== 'cratenight@gmail.com') {
    throw new Error('Only the CRATE NIGHT administrator can queue emails.');
  }
  if (!to || !subject || !message) throw new Error('Email recipient, subject and message are required.');
  const ref = await addDoc(collection(db, 'mail'), {
    to,
    message: { subject, text: message },
    createdAt: serverTimestamp(),
    status: 'queued'
  });
  return ref.id;
}
