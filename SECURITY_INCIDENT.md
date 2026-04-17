# Security Incident Report - Exposed API Keys

## Date
April 17, 2026

## Summary
Firebase API keys and configuration were accidentally committed to the Git repository in commit `6820d48d` (initial commit). Although the `.env` file was removed in commit `28f7d75` and added to `.gitignore`, the credentials remain accessible in the Git history.

## Exposed Credentials
The following Firebase credentials were exposed in `.env`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Risk Assessment

### Actual Risk: **MEDIUM**
While Firebase API keys are **not private secrets** (they're included in every web app bundle), this exposure still presents risks:

✅ **Low immediate risk because:**
- Firebase API keys are designed to be public (embedded in frontend code)
- All security is enforced server-side via Firebase Security Rules
- Firestore rules deny all client writes
- Authentication is required for all sensitive operations

⚠️ **Medium risk because:**
- Anyone can see your Firebase project configuration
- Potential for abuse if security rules have vulnerabilities
- Could be used for quota exhaustion attacks
- Best practice is to restrict API key usage to specific domains

## Recommended Actions

### 1. Restrict API Key (CRITICAL - Do this first)
Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials):
1. Find the API key: `AIzaSyAF-4uqgbX73JRwnoKZae0047nHHk9r8vM`
2. Click "Edit" (pencil icon)
3. Under "Application restrictions", select "HTTP referrers (web sites)"
4. Add your authorized domains:
   - `https://linkspilot.web.app/*`
   - `https://linkspilot.firebaseapp.com/*`
   - `http://localhost:5173/*` (for local development)
5. Click "Save"

This will prevent unauthorized use of the API key from other domains.

### 2. Review Firebase Security Rules
Verify that your Firestore security rules are properly configured to deny unauthorized access:
```bash
# Review current rules
firebase firestore:rules:list

# Ensure all client writes are denied
# All mutations should go through Cloud Functions with Admin SDK
```

### 3. Monitor Usage
Check Firebase Console for unusual activity:
- Authentication → Users (unexpected users)
- Firestore → Usage (unusual read/write patterns)
- Functions → Logs (unexpected invocations)

### 4. Rewrite Git History (OPTIONAL)
While the API key restriction is the most important step, you can also remove the file from Git history:

```bash
# ⚠️ WARNING: This rewrites history and requires force push
# All collaborators will need to re-clone the repository

# Use BFG Repo-Cleaner (recommended) or git filter-repo
git filter-repo --path .env --invert-paths

# Force push to all branches
git push origin --force --all
git push origin --force --tags
```

**Note:** Even after rewriting history, cached copies may exist on GitHub servers for some time. API key restriction (step 1) is the definitive security control.

### 5. Rotate Credentials (if needed)
If you detect suspicious activity or want maximum security:
1. Create a new Firebase Web App in your project
2. Update `.env` with the new credentials
3. Delete the old Web App from Firebase Console
4. Redeploy your application

## Prevention Measures Implemented
✅ `.env` added to `.gitignore` (commit 28f7d75)
✅ `.env.example` file created with placeholder values
✅ Security documentation added to README

## Future Prevention
- Always use `.env.example` files with placeholder values
- Run `git secrets` or pre-commit hooks to prevent credential commits
- Review `.gitignore` before first commit
- Use environment variable management services for production

## References
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Google Cloud API Key Restrictions](https://cloud.google.com/docs/authentication/api-keys)
- [Removing Sensitive Data from Git](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

**Status:** ⚠️ Waiting for manual API key restriction in Google Cloud Console
