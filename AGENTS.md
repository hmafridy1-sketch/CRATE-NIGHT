# CRATE NIGHT Agent Instructions

## Firebase-first rule
For every Firebase-related task, use the official Firebase Agent Skills before making implementation decisions.

Official Firebase Agent Skills:
https://github.com/firebase/agent-skills

For Codex, the official installation path is:
`codex plugin marketplace add firebase/skills`
`codex plugin add firebase@firebase`

If working through a general Agent Skills environment, the official Firebase repository documents:
`npx skills add firebase/skills`

## Project
- Firebase project ID: `crate-night-eaa55`
- Firebase Web App ID: `1:446764185371:web:e9e1ddeb80b09081fe85be`
- Default branch: `main`

## Firebase requirements
- Authentication: Email/Password, Google, Phone
- Firestore database
- Firebase Storage
- Firebase Hosting
- Strict production Security Rules

Never commit service-account JSON, private keys, passwords, or other credentials.
Never weaken production rules with `allow read, write: if true`.

## Authentication implementation
The web app uses Firebase Authentication SDK. Keep provider logic in `firebase.js` and keep sensitive/admin operations server-side.

Phone authentication requires a configured SMS region policy and authorized production domains in Firebase Authentication settings.
Google authentication requires the Google provider and authorized domains to be configured in Firebase Authentication.
