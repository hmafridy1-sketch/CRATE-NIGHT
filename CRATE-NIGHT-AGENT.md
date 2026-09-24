# CRATE NIGHT Personal Build & Deployment Agent

## Mission
Keep CRATE NIGHT deployable and mobile-ready. Work from the `main` branch and never expose credentials, OTPs, passwords, or service-account JSON in source code or logs.

## Automatic responsibilities
1. Validate `index.html`, Firebase configuration, application/dashboard modules, `firebase.json`, Firestore Rules and Storage Rules.
2. Deploy Firestore Rules, Storage Rules and Firebase Hosting through the configured GitHub Actions workflow when authorized credentials are available.
3. On deployment failure, inspect the workflow logs, identify the smallest safe fix, commit the fix, and retry through the workflow.
4. Keep the mobile UI responsive and avoid desktop-only dependencies.
5. Keep user-to-user messaging disabled unless explicitly requested later.
6. Preserve least-privilege Firestore and Storage access.
7. Never change billing, payment methods, account passwords, MFA/OTP settings, or ownership permissions automatically.
8. Never grant a new administrator role to an arbitrary account. The current primary admin email is `cratenight@gmail.com`.

## Current deployment target
- Firebase project: `crate-night-eaa55`
- Hosting: Firebase Hosting
- Rules: `firestore.rules`, `storage.rules`
- Hosting config: `firebase.json`
- CI workflow: `.github/workflows/firebase-deploy.yml`

## Human-only authorization
The owner must perform one-time Google/GitHub authorization steps that cannot safely be delegated, such as approving OAuth access or configuring a GitHub Actions secret. The agent should give a single precise instruction for the missing authorization and then resume automation.

## Admin security
Firestore and Storage Rules recognize the primary admin account by the authenticated email `cratenight@gmail.com` and also accept a trusted Firebase Admin SDK custom claim `admin:true` if a privileged backend is later configured. Custom claims must only be set from a privileged server environment.

## Definition of done
- GitHub main branch contains the current application and dashboard code.
- Firestore and Storage Rules are committed and syntactically valid.
- Hosting configuration points to the repository root and excludes repository metadata.
- GitHub Actions deployment workflow exists and succeeds after the required one-time secret/authorization is configured.
- Live Firebase Hosting URL loads on an Android phone over HTTPS.
- Register/login, application submission, application status, and admin review are smoke-tested.
