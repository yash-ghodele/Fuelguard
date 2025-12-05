# Post-Deployment Configuration Guide

## 📝 URLs to Update After Deployment

After deploying to Netlify, you'll get a URL like: `https://your-app-name.netlify.app`

### Files to Update:

#### 1. app/sitemap.ts (Line 4)
```typescript
const baseUrl = 'https://your-actual-netlify-url.netlify.app'
```

#### 2. app/robots.ts (Line 11)
```typescript
sitemap: 'https://your-actual-netlify-url.netlify.app/sitemap.xml',
```

#### 3. app/layout.tsx (Line 11)
```typescript
metadataBase: new URL('https://your-actual-netlify-url.netlify.app'),
```

---

## 🔐 Environment Variables for Netlify

### Required (Firebase):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Optional (Sentry Error Tracking):
```
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

#### To Get Sentry DSN:
1. Go to https://sentry.io
2. Create free account
3. Create new project → Select "Next.js"
4. Copy the DSN from project settings
5. Add to Netlify: Site settings → Environment variables

---

## 🚀 Quick Deployment Checklist

- [ ] Push code to GitHub
- [ ] Connect repo to Netlify
- [ ] Add environment variables
- [ ] Deploy (auto-build)
- [ ] Get deployment URL
- [ ] Update URLs in 3 files (sitemap, robots, layout)
- [ ] Redeploy with updated URLs
- [ ] (Optional) Add Sentry DSN
- [ ] Test live site

---

## 📋 Quick Commands

### After getting your URL, run these find-replace:
```
Find: https://FuelShield.netlify.app
Replace: https://your-actual-url.netlify.app
```

Files to update:
- `app/sitemap.ts`
- `app/robots.ts`
- `app/layout.tsx`

---

## ✅ Your Current Status

**Build**: ✅ SUCCESS (17 pages generated)  
**Sitemap**: ✅ Generated at /sitemap.xml  
**Robots**: ✅ Generated at /robots.txt  
**Dependencies**: ✅ 805 packages, 0 vulnerabilities  

**Ready to deploy!** 🚀
