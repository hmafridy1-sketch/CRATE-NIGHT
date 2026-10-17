# CRATE NIGHT — A–Z Audit and Implementation Roadmap

Audit date: 2026-10-18
Repository: https://github.com/hmafridy1-sketch/CRATE-NIGHT
Current branch: main
Firebase project configured in source: crate-night-eaa55
Live GitHub Pages URL: https://hmafridy1-sketch.github.io/CRATE-NIGHT/

## Executive summary

The repository contains a static HTML application with email/password, Google redirect, and phone sign-in flows; member application submission; application review UI; Firestore and Storage rules; and a Firebase Hosting deployment workflow. This is a working implementation scaffold, not yet verified as a production-ready application.

## Verified findings

- The repository is public, active, and the connected GitHub account has push/admin permissions.
- GitHub Pages/Jekyll deployment succeeded on 2026-10-17.
- The latest Firebase deployment workflow run on 2026-10-17 failed at the "Authenticate Firebase" step. The job steps show validation and Firebase CLI installation succeeded, but deployment was skipped.
- The workflow explicitly requires the GitHub Actions repository secret FIREBASE_SERVICE_ACCOUNT. The secret's absence is the workflow's expected failure path; the workflow run confirms the failure occurs at authentication, before deployment.
- `firebase-config.js` contains placeholder API key and app ID values, while `firebase.js` separately contains the actual web app configuration. The placeholder file is currently not imported by `index.html`; keep one source of truth to avoid future misconfiguration.
- The main page includes Home, Register, Login, Member Dashboard, and Admin Application Review sections.
- Firebase modules exist for authentication, applications, documents, email queueing, and dashboard/application views.
- Firestore and Storage rules are committed. Their live deployed versions have not been verified from this repository audit.
- `email.js` writes queue items to the Firestore `mail` collection; an email extension/service and successful delivery have not been verified.
- ID-card/certificate helpers create Firestore metadata and printable HTML; actual production issuance, verification, and PDF workflows have not been verified.
- No live Jarvis AI chat/tool execution integration is evidenced by the inspected main page and modules.

## Prioritized backlog

### P0 — Restore deployment path
1. In GitHub repository Settings → Secrets and variables → Actions, add `FIREBASE_SERVICE_ACCOUNT` as a repository secret containing a dedicated Firebase service-account JSON credential with only the permissions required to deploy this project.
2. Never commit the JSON credential or paste it into source code or chat.
3. Re-run the Firebase deployment workflow and verify the successful run and live Firebase Hosting URL.
4. Confirm the target Firebase project and billing/plan constraints before deploying.

### P1 — Verify live application behavior
1. Check the Firebase Authentication providers and authorized domains for GitHub Pages and Firebase Hosting.
2. Smoke-test email registration/login, Google redirect, phone/SMS sign-in, sign-out, and account profile creation.
3. Smoke-test application submission, member-only application reads, admin review, and status updates.
4. Confirm Firestore indexes required by queries are created when prompted.
5. Test responsive layout and browser console errors on mobile.

### P1 — Security review
1. Review admin authorization design. Prefer a server-managed Firebase custom claim or another trusted server-side authorization mechanism; do not trust client-side UI checks.
2. Keep Firestore and Storage rules restrictive and test both allowed and denied cases in the Firebase Emulator Suite.
3. Review upload rules for content type, size, ownership, and delete behavior.
4. Do not deploy rules until the owner confirms the intended admin account and access policy.
5. Treat browser Firebase web configuration as public client configuration; never put service-account credentials or private API secrets in browser code.

### P2 — Configuration and code quality
1. Make `firebase.js` the sole source of Firebase client configuration, or wire `firebase-config.js` correctly and remove duplication.
2. Ensure newly created Google-authenticated users get a Firestore profile consistently.
3. Add explicit error callbacks to realtime Firestore listeners so permission and index errors are visible.
4. Escape user-provided values when rendering generated document HTML.
5. Add automated checks for JavaScript syntax, HTML basics, and security-rule tests.

### P2 — Product modules
1. Build a proper admin dashboard with member/application metrics and role-aware navigation.
2. Connect the email queue to a configured, tested delivery service; queueing alone does not send email.
3. Complete document issuance lifecycle: approved application, unique document ID, printable/exportable document, and verification status.
4. Add audit logs for sensitive admin actions.

### P3 — Jarvis AI Agent
1. Define the first narrow use case (e.g. answer business questions from approved Crate Night data).
2. Add a server-side AI endpoint or trusted backend; never expose provider secret keys in client-side JavaScript.
3. Add authentication, rate limits, usage/cost limits, structured tool permissions, and audit logs.
4. Require human confirmation for consequential actions such as changing user status, issuing documents, or sending bulk email.
5. Test prompt injection, data isolation, tool failures, and privacy boundaries before expanding autonomy.

## Definition of ready for a first production pilot

- Firebase deployment workflow succeeds.
- Authentication providers and domains are configured and smoke-tested.
- Member data isolation and admin-only operations pass security tests.
- Application submission and review work end-to-end.
- Email delivery and document issuance are described accurately and tested, or clearly marked unavailable.
- Jarvis AI actions are server-side, scoped, logged, rate-limited, and require confirmation for sensitive operations.

## Current status

The most immediate blocker is Firebase deployment authentication. The latest workflow failed before deploying because the required GitHub Actions credential is not available to the workflow. This requires a one-time owner-managed secret configuration; no service-account credential should be committed to this repository.
