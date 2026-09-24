import { auth, db } from './firebase.js';
import { collection, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

export function watchMyApplications(callback, onError = console.error) {
  const user = auth.currentUser;
  if (!user) { callback([]); return () => {}; }
  const q = query(collection(db, 'applications'), where('applicantUid', '==', user.uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
}

export function renderApplicationRows(applications, container) {
  if (!container) return;
  if (!applications.length) {
    container.innerHTML = '<div class="empty-state">No applications yet.</div>';
    return;
  }
  container.innerHTML = applications.map(a => `
    <article class="application-card" data-id="${escapeHtml(a.id)}">
      <div><strong>${escapeHtml(a.name || 'Member')}</strong><span>${escapeHtml(a.applicantEmail || '')}</span></div>
      <span class="status status-${escapeHtml(a.status || 'pending')}">${escapeHtml(a.status || 'pending')}</span>
      <p>${escapeHtml(a.purpose || 'Application')}</p>
      ${a.reviewNote ? `<small>Review: ${escapeHtml(a.reviewNote)}</small>` : ''}
    </article>`).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
}
