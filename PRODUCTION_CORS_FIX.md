# Production CORS Fix - Upload Failing on Hosted Domain

## The Problem

You configured CORS for `localhost:4200`, but now you're hosting on a different domain. Firebase Storage is blocking requests from your production domain because it's not in the CORS whitelist.

## Solution: Update CORS for Your Production Domain

### Step 1: Identify Your Production Domain

What domain are you hosting on?
- GitHub Pages: `https://yourusername.github.io`
- Netlify: `https://yoursite.netlify.app`
- Vercel: `https://yoursite.vercel.app`
- Custom domain: `https://yourdomain.com`
- Other: `https://your-actual-domain.com`

### Step 2: Update cors.json

Edit `cors.json` in your project root and replace `yourdomain.com` with your actual domain:

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
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
    "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
```

### Examples for Common Hosting Platforms

#### GitHub Pages
```json
{
  "origin": [
    "https://yourusername.github.io",
    "https://yourusername.github.io/portfolio"
  ],
  "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
  "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
  "maxAgeSeconds": 3600
}
```

#### Netlify
```json
{
  "origin": [
    "https://yoursite.netlify.app",
    "https://yourdomain.com"
  ],
  "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
  "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
  "maxAgeSeconds": 3600
}
```

#### Vercel
```json
{
  "origin": [
    "https://yoursite.vercel.app",
    "https://yourdomain.com"
  ],
  "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
  "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
  "maxAgeSeconds": 3600
}
```

#### Firebase Hosting
```json
{
  "origin": [
    "https://yourproject.web.app",
    "https://yourproject.firebaseapp.com"
  ],
  "method": ["GET", "HEAD", "DELETE", "PUT", "POST", "OPTIONS"],
  "responseHeader": ["Content-Type", "x-goog-meta-uploaded-content-length", "x-goog-meta-*"],
  "maxAgeSeconds": 3600
}
```

### Step 3: Apply CORS Configuration

Open terminal/PowerShell and run:

```bash
# Make sure you're in the project directory
cd c:\Users\HP\OneDrive\Bureau\port\portfolio-main

# Set the project
gcloud config set project portflio-9868c

# Apply CORS
gsutil cors set cors.json gs://portflio-9868c.appspot.com
```

**Expected output:**
```
Setting CORS configuration on gs://portflio-9868c.appspot.com/...
```

### Step 4: Verify CORS Configuration

```bash
gsutil cors get gs://portflio-9868c.appspot.com
```

You should see your domain in the output.

### Step 5: Clear Cache and Test

1. **Hard refresh your hosted site**: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Clear browser cache**: `Ctrl+Shift+Delete`
3. **Try uploading a PDF**
4. **Check browser console** (F12) for errors

## Common Hosting Platforms

### GitHub Pages
- Domain: `https://yourusername.github.io`
- Repository: `yourusername/portfolio`
- Build command: `ng build --configuration production`
- Deploy folder: `dist/portfolio`

### Netlify
- Domain: `https://yoursite.netlify.app`
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `dist/portfolio`

### Vercel
- Domain: `https://yoursite.vercel.app`
- Connect GitHub repo
- Framework: Angular
- Build command: `ng build`
- Output directory: `dist/portfolio`

### Firebase Hosting
- Domain: `https://yourproject.web.app`
- Install: `npm install -g firebase-tools`
- Deploy: `firebase deploy`

## Troubleshooting

### Issue: "Still getting CORS error after updating"
**Solution:**
1. Verify domain in cors.json matches exactly
2. Run `gsutil cors set cors.json gs://portflio-9868c.appspot.com` again
3. Wait 5 minutes for changes to propagate
4. Hard refresh browser: `Ctrl+Shift+R`
5. Clear browser cache completely

### Issue: "gsutil: command not found"
**Solution:**
- Reinstall Google Cloud SDK
- Restart terminal/PowerShell
- Verify installation: `gcloud --version`

### Issue: "Permission denied" when running gsutil
**Solution:**
- Run `gcloud auth login` again
- Make sure you're logged in with correct Google account
- Verify account has Firebase admin permissions

### Issue: Upload still fails after CORS update
**Solution:**
1. Check console (F12) for exact error message
2. Verify domain in cors.json is correct
3. Try with a smaller file (< 1MB)
4. Check if domain is using HTTPS (required)
5. Verify Security Rules allow write access

## Security Rules for Production

Update your Storage Security Rules for production:

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

## Complete Checklist

- [ ] Identified your production domain
- [ ] Updated cors.json with your domain
- [ ] Ran `gsutil cors set cors.json gs://portflio-9868c.appspot.com`
- [ ] Verified with `gsutil cors get gs://portflio-9868c.appspot.com`
- [ ] Hard refreshed hosted site
- [ ] Cleared browser cache
- [ ] Tested upload on production domain
- [ ] Checked console for errors

## Next Steps

1. **Tell me your production domain** (e.g., yourdomain.com, yoursite.netlify.app, etc.)
2. **Update cors.json** with your domain
3. **Run gsutil command** to apply changes
4. **Test upload** on your hosted site
5. **Check console** for any remaining errors

## Support Resources

- [Google Cloud CORS Configuration](https://cloud.google.com/storage/docs/configuring-cors)
- [Firebase Storage CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [gsutil Documentation](https://cloud.google.com/storage/docs/gsutil)
