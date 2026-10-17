# CRATE NIGHT Jarvis Task Engine — Phase 1

This branch adds an initial task workspace without replacing the existing website.

## Files
- `jarvis.html`: responsive black-and-gold task dashboard.
- `jarvis-task-engine.js`: Firebase Authentication-aware task CRUD and live updates.
- `firestore.rules`: adds owner-only access to the `tasks` collection while preserving existing application rules.

## Requirements before browser testing
1. Firebase Web App config in `firebase.js` must match the Firebase project.
2. Firebase Authentication must have Email/Password enabled and a user must be registered.
3. Deploy the updated Firestore Rules to the intended Firebase project after reviewing them.
4. Serve the website over HTTPS or localhost; ES module imports generally will not work by opening the HTML file directly as `file://`.

## Data model
Each `tasks/{taskId}` document has:
- `ownerUid`: authenticated Firebase UID
- `title`: required string, up to 120 characters
- `description`: optional string, up to 1200 characters
- `priority`: `low`, `normal`, or `high`
- `status`: `queued`, `in_progress`, `completed`, or `failed`
- `createdAt`, `updatedAt`: server timestamps
- `completedAt`: timestamp or null

## Safety notes
- This is a user-operated task tracker, not yet an autonomous AI agent.
- No AI API, background worker, email sender, or external-action tool is enabled.
- No production deployment is triggered by these files.
- Do not put credentials, passwords, OTPs, or private keys into task descriptions.
- Review and test rules before deploying. The Firebase web API key is not a service-account secret, but it should still be used with proper Firebase API restrictions and Security Rules.
