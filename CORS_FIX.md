# CORS Error Fix - Upload Stuck at 0%

## The Problem

Your upload is stuck at 0% because of a **CORS (Cross-Origin Resource Sharing)** issue:
- Request is being made to `firebasestorage.googleapis.com`
- Browser is blocking it due to `strict-origin-when-cross-origin` referrer policy
- Firebase Storage bucket doesn't have CORS configured for `localhost:4200`

## The Solution

You need to configure CORS on your Firebase Storage bucket using Google Cloud SDK.

## Step 1: Install Google Cloud SDK

### Windows:
1. Download from: https://cloud.google.com/sdk/docs/install-cloud-sdk
2. Run the installer
3. Follow the installation wizard
4. Restart your terminal/PowerShell

### Verify Installation:
```bash
gcloud --version
```

## Step 2: Authenticate with Google Cloud

```bash
gcloud auth login
```

This will:
1. Open a browser window
2. Ask you to sign in with your Google account
3. Grant permissions to Google Cloud SDK
4. Return to terminal with confirmation

## Step 3: Set Your Project

```bash
gcloud config set project portflio-9868c
```

## Step 4: Apply CORS Configuration

A `cors.json` file has been created in your project root with the correct configuration.

Run this command:

```bash
gsutil cors set cors.json gs://portflio-9868c.appspot.com
```

**Expected output:**
```
Setting CORS configuration on gs://portflio-9868c.appspot.com/...
```

## Step 5: Verify CORS Configuration

```bash
gsutil cors get gs://portflio-9868c.appspot.com
```

**Expected output:**
```json
[
  {
    "origin": ["http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*"],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
    "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
```

## Step 6: Clear Cache and Test

```bash
# Clear browser cache
# Ctrl+Shift+Delete (Windows/Linux)
# Cmd+Shift+Delete (Mac)

# Restart dev server
npm start
```

## Step 7: Test Upload

1. Go to Admin page
2. Login: `admin` / `password123`
3. Select a PDF file
4. Click Upload
5. Progress should now go from 0% to 100%

## What CORS Configuration Does

```json
{
  "origin": ["http://localhost:4200", ...],     // Allows requests from localhost:4200
  "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],  // Allows these HTTP methods
  "responseHeader": ["Content-Type", ...],       // Allows these response headers
  "maxAgeSeconds": 3600                          // Cache CORS for 1 hour
}
```

## If You Don't Have Google Cloud SDK

### Alternative: Use Firebase Console (Limited)

Unfortunately, Firebase Console doesn't have a direct CORS configuration UI. You **must** use Google Cloud SDK.

### Quick Install (Windows PowerShell):

```powershell
# Download and run installer
(New-Object Net.WebClient).DownloadFile('https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe', "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

Then restart PowerShell and continue with Step 2.

## Troubleshooting

### Issue: "gcloud: command not found"
**Solution:**
- Verify Google Cloud SDK is installed
- Restart terminal/PowerShell
- Add to PATH if needed

### Issue: "Permission denied" when running gsutil
**Solution:**
- Run `gcloud auth login` again
- Make sure you're logged in with correct Google account
- Verify account has Firebase admin permissions

### Issue: "Bucket not found"
**Solution:**
- Verify bucket name: `portflio-9868c.appspot.com`
- Check project is set: `gcloud config set project portflio-9868c`
- Verify bucket exists in Firebase Console

### Issue: Upload still stuck at 0% after CORS fix
**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear browser cache completely
3. Restart dev server: `npm start`
4. Try uploading again

## For Production

When deploying to production, update `cors.json` with your domain:

```json
[
  {
    "origin": ["https://yourdomain.com", "https://www.yourdomain.com"],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
    "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
```

Then run:
```bash
gsutil cors set cors.json gs://portflio-9868c.appspot.com
```

## Complete Step-by-Step Summary

1. ✅ Install Google Cloud SDK
2. ✅ Run `gcloud auth login`
3. ✅ Run `gcloud config set project portflio-9868c`
4. ✅ Run `gsutil cors set cors.json gs://portflio-9868c.appspot.com`
5. ✅ Verify with `gsutil cors get gs://portflio-9868c.appspot.com`
6. ✅ Clear browser cache
7. ✅ Restart dev server
8. ✅ Test upload

## Expected Result

After CORS is configured:
- ✅ Upload progress goes from 0% to 100%
- ✅ File appears in Firebase Console → Storage
- ✅ Download URL is retrieved
- ✅ Alert shows "CV uploaded successfully! ✅"

## Support Resources

- [Google Cloud SDK Installation](https://cloud.google.com/sdk/docs/install)
- [gsutil CORS Configuration](https://cloud.google.com/storage/docs/configuring-cors)
- [Firebase Storage CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
