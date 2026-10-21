# Jarvis Admin Authentication — setup and validation

This change adds a Firebase Email/Password sign-in page and a client-side check for the Firebase custom claim `admin: true`. Firestore rules must still enforce all data access; hiding a page is not a security boundary.

## Files
- `jarvis-admin-login.html`: sign-in UI.
- `jarvis-admin-auth.js`: Firebase config and reusable admin-claim guard.
- `admin-dashboard.html`: redirects unauthenticated or non-admin users to sign-in.

## Required Firebase Console steps
1. Open Firebase Console for project `crate-night-eaa55` → Project settings → General → Your apps. Copy the Web API key and replace `REPLACE_WITH_FIREBASE_API_KEY` in `jarvis-admin-auth.js`. The app ID is already populated from the existing project setup.
2. Authentication → Sign-in method → enable Email/Password.
3. Authentication → Settings → Authorized domains: add the exact host serving this page (for example, the GitHub Pages host if testing there).
4. Create/sign in with the intended owner account. Do not put passwords or service-account JSON in GitHub.
5. Assign the custom claim `admin: true` only from a trusted Admin SDK environment. Never assign admin claims from browser code. A claim can be set by a trusted server or a one-time local Admin SDK script using credentials kept outside the repository. Refresh the ID token after assignment.
6. Review `firestore.rules` and deploy rules deliberately. Existing rules expect the trusted token claim `admin == true`.

## Test checklist
- [ ] With an invalid/missing API key, sign-in fails clearly; no admin access is granted.
- [ ] A valid ordinary user can sign in but is signed out and denied the admin dashboard.
- [ ] A trusted admin account with the `admin: true` claim can sign in and open the dashboard.
- [ ] Signing out or opening the dashboard in a signed-out browser redirects to the sign-in page.
- [ ] Firestore Rules Simulator confirms a non-admin cannot read other users, approve applications, or issue documents.
- [ ] Run a real browser test on the intended hosting domain after authorized-domain configuration.

## Important limitations
- The repository changes do not change Firebase Console settings or issue custom claims.
- GitHub Pages is static hosting; it cannot safely store service-account credentials or provide trusted server-side authorization.
- Firebase web API keys are project identifiers, not admin secrets, but should be configured correctly and API restrictions reviewed.
- This is not production-verified until the checklist is run against the actual Firebase project.
