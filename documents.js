import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

export async function createGeneratedDocument(type, application) {
  const allowed = ['id-card', 'certificate'];
  if (!allowed.includes(type)) throw new Error('Invalid document type.');
  if (!application?.id || !application?.name) throw new Error('Application data is incomplete.');
  const ref = await addDoc(collection(db, 'generatedDocuments'), {
    type,
    applicationId: application.id,
    applicantUid: application.applicantUid || '',
    applicantEmail: application.applicantEmail || '',
    name: application.name,
    status: 'issued',
    issuedAt: serverTimestamp()
  });
  return ref.id;
}

export function renderDocumentHtml(type, application, documentId) {
  const title = type === 'id-card' ? 'CRATE NIGHT ID CARD' : 'CRATE NIGHT CERTIFICATE';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font-family:Arial,sans-serif;background:#0b0b0b;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.card{width:min(90vw,720px);padding:32px;border:1px solid #d4af37;border-radius:20px;background:#111;text-align:center}.gold{color:#d4af37}.id{font-size:12px;opacity:.7}</style></head><body><section class="card"><h1 class="gold">${title}</h1><h2>${application.name || 'Member'}</h2><p>CRATE NIGHT Member</p><p class="id">Document ID: ${documentId || 'pending'}</p><button onclick="print()">Print / Save PDF</button></section></body></html>`;
}
