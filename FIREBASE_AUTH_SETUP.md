# CRATE NIGHT Firebase Authentication

Firebase project: `crate-night-eaa55`
Firebase Web App ID: `1:446764185371:web:e9e1ddeb80b09081fe85be`

The web client now includes flows for:
- Email/password sign-up and sign-in
- Google sign-in using redirect flow (mobile-friendly)
- Phone number sign-in with SMS verification and reCAPTCHA

## Firebase Console requirements

Enable these providers in Firebase Console → Authentication → Sign-in method:
1. Email/Password
2. Google
3. Phone

For Google, configure the project's OAuth/authorized domains as required by Firebase.
For Phone Authentication, configure an SMS region policy and add every production web domain under Authentication → Settings → Authorized domains. Firebase's phone-auth documentation notes that new projects may default to allowing no SMS regions, so the SMS region policy must be explicitly configured.

Do not put service-account JSON, private keys, or passwords in this repository.
