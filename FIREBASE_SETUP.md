# Firebase Connection Setup Guide

## Overview
This document provides troubleshooting steps for Firebase connection issues in your Angular portfolio application.

## Current Configuration

### Firebase Project Details
- **Project ID**: portflio-9868c
- **Storage Bucket**: portflio-9868c.appspot.com
- **Auth Domain**: portflio-9868c.firebaseapp.com

### Installed Packages
- `@angular/fire`: ^7.6.1 (AngularFire - Angular wrapper for Firebase)
- `firebase`: ^9.23.0 (Firebase SDK)

## What Was Fixed

### 1. **Module Imports** ✅
Added missing Firebase modules to `app.module.ts`:
- `AngularFireModule` - Core Firebase initialization
- `AngularFireStorageModule` - Firebase Storage for file uploads
- `AngularFireAuthModule` - Firebase Authentication

### 2. **Firebase Service** ✅
Created `src/app/firebase.service.ts` to centralize Firebase operations:
- File uploads to Storage
- Download URL retrieval
- File deletion
- Directory listing

### 3. **Admin Component Update** ✅
Updated `src/app/admin/admin.component.ts` to use the new Firebase service instead of direct storage references.

### 4. **Environment Configuration** ✅
- Updated `src/environments/environment.ts`
- Created `src/environments/environment.prod.ts`

## Troubleshooting Steps

### Step 1: Verify Firebase Console Access
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project "portflio-9868c"
3. Check:
   - **Storage**: Should show "portflio-9868c.appspot.com"
   - **Authentication**: Verify authentication methods are enabled
   - **Firestore/Realtime Database**: If using database features

### Step 2: Check Firebase Security Rules
Navigate to **Storage** → **Rules** and ensure they allow your operations:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cvs/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

For development/testing (NOT recommended for production):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Verify API Keys
The API key in `environment.ts` should be a **Web API Key** (not a Server API Key):
- Go to Firebase Console → Project Settings → Service Accounts
- Verify the API key is enabled for your domain

### Step 4: Check Browser Console for Errors
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for Firebase-related errors
4. Common errors:
   - `"Firebase: Error (auth/invalid-api-key)"`
   - `"Firebase: Error (storage/unauthorized)"`
   - `"Firebase: Error (app/invalid-credential)"`

### Step 5: Verify CORS Configuration
If you see CORS errors:
1. Go to Firebase Console → Storage → Rules
2. Ensure your domain is allowed
3. For local development, `localhost:4200` should work by default

### Step 6: Test Firebase Connection
Add this to your component to test:
```typescript
import { AngularFireAuth } from '@angular/fire/compat/auth';

constructor(private auth: AngularFireAuth) {
  this.auth.authState.subscribe(
    user => console.log('Firebase connected:', user),
    error => console.error('Firebase error:', error)
  );
}
```

## Common Issues & Solutions

### Issue: "Firebase is not defined"
**Solution**: Ensure `AngularFireModule.initializeApp(environment.firebase)` is in `app.module.ts` imports

### Issue: "Storage bucket not found"
**Solution**: 
- Verify `storageBucket` in environment.ts matches Firebase Console
- Check Firebase Storage is enabled in your project

### Issue: "Permission denied" when uploading
**Solution**:
- Check Firebase Storage Rules (see Step 2)
- Verify authentication is set up correctly
- For admin uploads, ensure authentication is working

### Issue: "CORS error"
**Solution**:
- This is usually a browser security issue
- Verify your domain is whitelisted in Firebase
- For local development, ensure you're using `localhost:4200`

### Issue: "Module not found" errors
**Solution**: Run `npm install` to ensure all dependencies are installed:
```bash
npm install
```

## Testing the Connection

### 1. Test Admin Upload
1. Navigate to the Admin page
2. Login with credentials (default: admin/password123)
3. Try uploading a PDF file
4. Check browser console for errors
5. Verify file appears in Firebase Console → Storage

### 2. Test File Download
1. After successful upload, click "Test Download"
2. File should open in a new tab
3. Check browser console for any errors

## Next Steps

### If Still Having Issues:
1. **Clear Cache**: 
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Rebuild Project**:
   ```bash
   ng build --configuration development
   ```

3. **Check Firebase Console Logs**:
   - Go to Firebase Console → Logs
   - Look for authentication or storage errors

4. **Verify Credentials**:
   - Ensure API key hasn't been regenerated
   - Check if project has been deleted/recreated

### Enable Firebase Debugging
Add to your main.ts or app.component.ts:
```typescript
import { enableLogging } from 'firebase/app';
enableLogging(true);
```

## File Structure
```
src/
├── app/
│   ├── firebase.service.ts          (NEW - Firebase operations)
│   ├── admin/
│   │   └── admin.component.ts       (UPDATED - uses firebase.service)
│   └── app.module.ts                (UPDATED - added Firebase modules)
└── environments/
    ├── environment.ts               (UPDATED)
    └── environment.prod.ts          (NEW)
```

## Support Resources
- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/storage/security)
