# Jarvis Readiness Audit — 2026-10-20

## Scope and evidence
Reviewed the current `main` branch files `index.html`, `firebase.js`, `firebase-config.js`, `firebase.json`, `firestore.rules`, `storage.rules`, `FIREBASE_AUTH_SETUP.md`, `NEXT-IMPLEMENTATION-STEPS.md`, and `AGENTS.md`. This is a source review, not a live Firebase test or a browser end-to-end test.

## Current baseline
- The repository is accessible and the connected GitHub account has push/admin permission.
- The current site is a static HTML/CSS/ES-module application, not yet a server-backed AI agent.
- The page imports `firebase.js`, which contains the web app configuration and auth flows.
- Firestore rules use the `admin: true` custom claim; an email address alone does not grant admin access.
- Firebase Hosting/Rules deployment is documented as blocked until the trusted owner configures the GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT`.
- The separate `firebase-config.js` still contains placeholder values. Confirm whether any file imports it; if unused, remove it or make it clearly non-runtime to avoid confusion.
- The Storage rules limit individual upload size to under 10 MiB and scope paths by user, but do not restrict content type. Define permitted file types and upload paths before accepting real customer files.

## Blockers before production
1. **Deployment:** a trusted project owner must configure the deployment secret in GitHub repository settings. Never commit or share the service-account JSON.
2. **Admin bootstrap:** set the `admin: true` custom claim for the intended administrator UID from a trusted private environment. Do not create a client-side admin-grant button.
3. **Firebase provider configuration:** enable only intended providers and confirm authorized domains, Google OAuth settings, and phone SMS region/reCAPTCHA configuration.
4. **Security verification:** test Firestore and Storage rules using the Firebase Emulator Suite or Rules Playground with member, other-member, and admin identities.
5. **Frontend verification:** test registration, sign-in, Google redirect, phone verification, application submission, approval/rejection, and responsive navigation in a browser.
6. **AI backend:** do not place model API keys in browser code. Add a trusted server endpoint (for example, Cloud Functions or another server runtime) before connecting live AI actions or webhooks.
7. **Operational safety:** require explicit approval for external messages, document issuance, account changes, deployments, or other consequential actions; log the actor, action, target, timestamp, and outcome.

## Recommended implementation order
- [ ] Confirm which Firebase config module is canonical and remove the unused placeholder only after reference search.
- [ ] Run lint/build and browser smoke tests; document exact results.
- [ ] Test and tighten Firestore/Storage rules; add Storage content-type and path constraints appropriate to supported documents.
- [ ] Complete owner-managed deployment setup and deploy rules/indexes/hosting.
- [ ] Verify custom-claim admin access and negative permission tests.
- [ ] Add a trusted backend for AI calls, secrets, webhook verification, rate limiting, and audit logs.
- [ ] Implement one low-risk Jarvis task end-to-end with a human confirmation step before expanding automation.

## Acceptance criteria
A task is not considered complete until the code/config change is identified, automated checks pass where available, manual tests are recorded, the deployment target is confirmed, and any remaining blocker is stated plainly.

## Safety note
Do not use real customer data or treat the service as production-ready until deployment, authentication, authorization, and negative access tests have passed.
