# Crate Night — next implementation steps

## Current build status

The repository now contains the premium responsive homepage and shared styles, plus the existing Firebase Auth and application modules. GitHub Pages and Firebase deployments are separate workflows; a successful Pages build does **not** mean Firebase services were deployed or tested.

## 1. Publish the static website

1. Open **Settings → Pages** in the GitHub repository.
2. Confirm the publishing source is the `main` branch and the repository root (`/`).
3. Open **Actions** and check **Deploy Jekyll with GitHub Pages dependencies preinstalled**. Wait for the latest run to finish successfully.
4. Open the public Pages URL in a private/incognito browser tab and hard-refresh. Test the navigation and layout on mobile and desktop.

## 2. Firebase deployment prerequisite

The workflow `.github/workflows/firebase-deploy.yml` deliberately stops before deployment if the repository secret `FIREBASE_SERVICE_ACCOUNT` is missing. It needs a JSON service-account key for the Firebase project `crate-night-eaa55`.

Only a project owner should create a least-privilege deployment service account and add its JSON content in **Repository → Settings → Secrets and variables → Actions → New repository secret** with the exact name `FIREBASE_SERVICE_ACCOUNT`. Never commit the JSON key, paste it into a chat, or put it in website JavaScript. If you cannot safely create/manage service-account keys, leave this deployment blocked rather than weakening authentication.

The workflow deploys Firestore Rules, Storage Rules and Firebase Hosting. The GitHub Pages website is published separately.

## 3. Configure Firebase Authentication

In Firebase Console → Authentication → Sign-in method, enable only the providers you intend to support (Email/Password, Google and/or Phone). In Authentication → Settings → Authorized domains, add the actual GitHub Pages hostname if it is not already present. Phone authentication also needs the appropriate reCAPTCHA and SMS configuration.

The public Firebase web config in `firebase.js` identifies the project; it is not an Admin SDK credential. Protect data using Firebase Security Rules and never put service-account keys in frontend files.

## 4. Admin access is claim-based

The dashboard and Firestore/Storage rules now require the Firebase Authentication custom claim `admin: true`. An email address alone no longer grants administrator access. This prevents someone from gaining admin permissions just by signing in with a matching email address.

A trusted project owner must assign the custom claim to the intended administrator UID using the Firebase Admin SDK in a private, trusted environment. Do not add a client-side button to grant admin access. After the claim is assigned, sign out and sign back in (or refresh the ID token) before testing the Admin dashboard.

## 5. Functional test checklist

- [ ] Register with a test email and a strong password.
- [ ] Confirm the user profile appears in Firestore under `users/{uid}`.
- [ ] Sign out and sign in again.
- [ ] Submit a test application and confirm it appears under `applications`.
- [ ] Confirm a normal member can read only their own applications and cannot approve/reject them.
- [ ] Confirm an administrator with the `admin: true` custom claim can review applications.
- [ ] Confirm another user's documents and applications are not accessible.
- [ ] Test invalid sign-in, network errors and mobile layout.
- [ ] Confirm Firebase Rules are deployed before treating the app as production-ready.

## Known limitations

- This is a static frontend using browser ES modules; it does not yet include a server-side AI agent or trusted backend API.
- Email delivery, generated ID cards/certificates, scheduled automations and AI actions are not yet implemented end-to-end.
- Do not use real customer data until authentication, deployed rules, admin claims and the test checklist are verified.
