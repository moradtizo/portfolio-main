# Firebase Storage 404 Error - Complete Fix Guide

## Problem
You're getting a **404 Not Found** error when trying to upload files to Firebase Storage:
```
https://firebasestorage.googleapis.com/v0/b/portflio-9868c.appspot.com/o?name=cvs%2FCV_2025-11-14_Mourad_Tizougarine.pdf
Request Method: OPTIONS
Status Code: 404
```

## Root Causes & Solutions

### ✅ Solution 1: Enable Firebase Storage in Your Project

**Step 1: Go to Firebase Console**
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **portflio-9868c**

**Step 2: Enable Cloud Storage**
1. In the left sidebar, click **Storage** (under "Build")
2. If you see "Get Started" button, click it
3. Choose a location (default is usually fine)
4. Click "Done"

**Step 3: Verify Storage Bucket**
- You should see: `portflio-9868c.appspot.com`
- This matches your `environment.ts` configuration ✅

### ✅ Solution 2: Configure Firebase Storage Security Rules

**Step 1: Go to Storage Rules**
1. In Firebase Console → Storage
2. Click the **Rules** tab

**Step 2: Update Rules for Development**
Replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to write to cvs folder
    match /cvs/{fileName} {
      allow write: if request.auth != null;
    }
  }
}
```

**Step 3: Publish Rules**
- Click "Publish" button

### ✅ Solution 3: Enable Anonymous Authentication (For Testing)

If you want to test without authentication:

**Step 1: Go to Authentication**
1. Firebase Console → Authentication
2. Click **Sign-in method** tab

**Step 2: Enable Anonymous**
1. Find "Anonymous" in the list
2. Click it and toggle "Enable"
3. Click "Save"

**Step 3: Update Security Rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cvs/{fileName} {
      // Allow anyone to upload (for testing only!)
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING**: This is NOT secure for production. Use only for testing!

### ✅ Solution 4: Verify Environment Configuration

Check your `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDpP3DMsyBVr-GF-2Ile-1SDsbzfcYnlNo",
    authDomain: "portflio-9868c.firebaseapp.com",
    projectId: "portflio-9868c",
    storageBucket: "portflio-9868c.appspot.com",  // ✅ Must match your bucket
    messagingSenderId: "357180193484",
    appId: "1:357180193484:web:622a90d7fc766b11f7a069",
    measurementId: "G-1CGENHS10S"
  }
};
```

### ✅ Solution 5: Check CORS Configuration

**Step 1: Create CORS Configuration File**

Create a file named `cors.json` in your project root:

```json
[
  {
    "origin": ["http://localhost:4200", "http://localhost:*"],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
    "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length"],
    "maxAgeSeconds": 3600
  }
]
```

**Step 2: Apply CORS Configuration**

Run this command in your terminal:

```bash
gsutil cors set cors.json gs://portflio-9868c.appspot.com
```

If you don't have `gsutil` installed:
1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Run: `gcloud auth login`
3. Then run the gsutil command above

## Testing the Fix

### Step 1: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button → "Empty cache and hard refresh"
3. Or: Ctrl+Shift+Delete → Clear browsing data

### Step 2: Test Upload
1. Go to Admin page
2. Login (admin/password123)
3. Select a PDF file
4. Click upload
5. Check browser console (F12) for detailed logs

### Step 3: Check Console Logs
Look for these messages:
```
✅ Starting upload: cvs/CV_2025-11-14_Mourad_Tizougarine.pdf
✅ Upload progress: 0%
✅ Upload progress: 50%
✅ Upload progress: 100%
✅ Upload complete, retrieving download URL...
✅ Download URL retrieved: https://firebasestorage.googleapis.com/...
```

### Step 4: Verify in Firebase Console
1. Go to Firebase Console → Storage
2. You should see your PDF file in the `cvs/` folder
3. Click the file to see its details

## Common Error Messages & Fixes

### Error: "Firebase Storage bucket not found"
**Fix**: 
- Verify `storageBucket` in environment.ts matches Firebase Console
- Enable Cloud Storage in Firebase Console

### Error: "Permission denied"
**Fix**:
- Update Security Rules (see Solution 2)
- Enable Anonymous Authentication (see Solution 3)

### Error: "CORS error"
**Fix**:
- Apply CORS configuration (see Solution 5)
- Ensure localhost:4200 is in CORS origins

### Error: "Invalid API key"
**Fix**:
- Go to Firebase Console → Project Settings
- Verify API key is enabled
- Check if API key has been regenerated

## Production Security Rules

For production, use these secure rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read their own files
    match /cvs/{userId}/{fileName} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

## Debugging Steps

### 1. Check Network Tab
1. Open DevTools → Network tab
2. Try uploading a file
3. Look for failed requests
4. Click on the failed request to see details

### 2. Check Console Logs
The updated code logs detailed information:
```javascript
console.log('Starting upload: cvs/filename.pdf');
console.log('Upload progress: 50%');
console.log('Upload complete, retrieving download URL...');
```

### 3. Enable Firebase Debug Logging
Add to your `main.ts`:
```typescript
import { enableLogging } from 'firebase/app';
enableLogging(true);
```

### 4. Check Firebase Console Logs
1. Firebase Console → Logs
2. Look for authentication or storage errors

## File Structure After Fix
```
src/
├── app/
│   ├── firebase.service.ts          (Updated with better logging)
│   ├── admin/
│   │   └── admin.component.ts       (Updated with proper error handling)
│   └── app.module.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── main.ts
```

## Next Steps

1. **Enable Storage**: Follow Solution 1
2. **Update Rules**: Follow Solution 2
3. **Test Upload**: Follow Testing section
4. **Check Logs**: Monitor browser console for detailed information
5. **Verify Files**: Check Firebase Console → Storage

## Support Resources
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/storage/security)
- [AngularFire Storage Guide](https://github.com/angular/angularfire/blob/master/docs/storage/storage.md)
- [Google Cloud CORS Configuration](https://cloud.google.com/storage/docs/configuring-cors)

## Quick Checklist
- [ ] Firebase Storage enabled in Console
- [ ] Security Rules updated
- [ ] CORS configured (if needed)
- [ ] Environment.ts has correct storageBucket
- [ ] Browser cache cleared
- [ ] Console logs show upload progress
- [ ] File appears in Firebase Console Storage
