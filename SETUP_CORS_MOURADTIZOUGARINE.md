# CORS Setup for mouradtizougarine.online

## Your Configuration

**Domain:** `https://www.mouradtizougarine.online`
**Project:** `portflio-9868c`
**Storage Bucket:** `portflio-9868c.appspot.com`

## Step 1: Apply CORS Configuration

The `cors.json` file has been updated with your domain. Now apply it:

```bash
# Navigate to your project directory
cd c:\Users\HP\OneDrive\Bureau\port\portfolio-main

# Set the Google Cloud project
gcloud config set project portflio-9868c

# Apply CORS configuration
gsutil cors set cors.json gs://portflio-9868c.appspot.com
```

**Expected output:**
```
Setting CORS configuration on gs://portflio-9868c.appspot.com/...
```

## Step 2: Verify CORS Configuration

```bash
gsutil cors get gs://portflio-9868c.appspot.com
```

**Expected output:**
```json
[
  {
    "origin": [
      "http://localhost:4200",
      "http://localhost:*",
      "http://127.0.0.1:*",
      "https://localhost:4200",
      "https://localhost:*",
      "https://127.0.0.1:*"
    ],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
    "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  },
  {
    "origin": [
      "https://mouradtizougarine.online",
      "https://www.mouradtizougarine.online"
    ],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
    "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
```

## Step 3: Test Upload on Production

1. **Go to your admin page:**
   ```
   https://www.mouradtizougarine.online/admin
   ```

2. **Login with credentials:**
   - Username: `admin`
   - Password: `password123`

3. **Upload a PDF file:**
   - Click file input
   - Select a PDF
   - Watch progress: 0% → 100%

4. **Check console (F12):**
   - Should see: `Upload progress: 100%`
   - Should see: `File uploaded successfully!`
   - Should see: `Download URL retrieved successfully`

5. **Verify file in Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select `portflio-9868c`
   - Click **Storage**
   - You should see your PDF in the `cvs/` folder

## Step 4: Test Download

1. Click **Test Download** button
2. PDF should open in a new tab
3. Verify it's the correct file

## Troubleshooting

### Issue: Upload still fails after CORS update
**Solution:**
1. Wait 5 minutes for CORS changes to propagate
2. Hard refresh: `Ctrl+Shift+R`
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Try again

### Issue: "CORS Error" in console
**Solution:**
1. Verify domain in cors.json: `https://www.mouradtizougarine.online`
2. Run `gsutil cors set cors.json gs://portflio-9868c.appspot.com` again
3. Verify with `gsutil cors get gs://portflio-9868c.appspot.com`
4. Check that your domain appears in the output

### Issue: Upload shows 0% and doesn't progress
**Solution:**
1. Check browser Network tab (F12)
2. Look for requests to `firebasestorage.googleapis.com`
3. Check if they're being blocked (red X)
4. If blocked, CORS is not configured correctly
5. Repeat Step 1 and Step 2

### Issue: "gsutil: command not found"
**Solution:**
- Verify Google Cloud SDK is installed
- Restart terminal/PowerShell
- Run `gcloud --version` to verify

## Expected Behavior After CORS Fix

✅ Upload progress shows 0% → 25% → 50% → 75% → 100%
✅ File appears in Firebase Console → Storage → cvs/
✅ Download URL is retrieved automatically
✅ Alert shows "CV uploaded successfully! ✅"
✅ Test Download button works

## Security Rules

Your current Storage Security Rules allow anyone to upload. For production, consider updating to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow authenticated users to upload to cvs folder
    match /cvs/{fileName} {
      allow write: if request.auth != null;
    }
  }
}
```

## Quick Checklist

- [ ] Ran `gsutil cors set cors.json gs://portflio-9868c.appspot.com`
- [ ] Verified with `gsutil cors get gs://portflio-9868c.appspot.com`
- [ ] Waited 5 minutes for changes to propagate
- [ ] Hard refreshed production site
- [ ] Cleared browser cache
- [ ] Tested upload on `https://www.mouradtizougarine.online/admin`
- [ ] File appears in Firebase Console Storage
- [ ] Download works

## Support

If you still have issues:
1. Check console logs (F12)
2. Check Network tab for failed requests
3. Verify CORS configuration with `gsutil cors get`
4. Check Firebase Console for any errors
5. Try uploading a small file (< 1MB) first

## Next Steps

1. Run the gsutil command to apply CORS
2. Wait 5 minutes
3. Test upload on your production site
4. Verify file appears in Firebase Storage
5. Test download functionality
