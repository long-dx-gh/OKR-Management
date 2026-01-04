# 🚀 Deploy OKR Platform to GitHub Pages

**Repository**: https://github.com/long-dx-gh/OKR-Management  
**Live URL**: https://long-dx-gh.github.io/OKR-Management/  
**Status**: Ready to deploy

---

## 📋 Prerequisites

✅ All completed:
- [x] GitHub repository exists
- [x] Code is ready
- [x] Supabase backend configured
- [x] Build script works

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Install gh-pages Package
```bash
npm install --save-dev gh-pages
```

### Step 2: Build and Deploy
```bash
npm run deploy
```

### Step 3: Access Your App
```
URL: https://long-dx-gh.github.io/OKR-Management/
```

That's it! ✅

---

## 📊 What Happens During Deploy

```
npm run deploy
    ↓
1. Run "predeploy" → npm run build
    ↓
2. TypeScript compilation (tsc)
    ↓
3. Vite build → Creates dist/ folder
    ↓
4. gh-pages pushes dist/ to gh-pages branch
    ↓
5. GitHub Pages serves the app
    ↓
✅ Live at: https://long-dx-gh.github.io/OKR-Management/
```

---

## 🔧 Configuration Changes Made

### 1. package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.1"
  }
}
```

### 2. vite.config.ts
```typescript
export default defineConfig({
  base: '/OKR-Management/',  // ← Added for GitHub Pages
  // ... rest of config
})
```

---

## 🌐 Enabling GitHub Pages

After first deploy, configure GitHub Pages:

### Steps:

1. **Go to Repository Settings**
   - https://github.com/long-dx-gh/OKR-Management/settings/pages

2. **Configure Source**
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Click **Save**

3. **Wait for Deployment**
   - Takes 1-2 minutes
   - GitHub will show deployment status
   - Green checkmark = Live! ✅

4. **Access Your App**
   - https://long-dx-gh.github.io/OKR-Management/

---

## 🔄 Update Deployment

Every time you make changes:

```bash
# 1. Make your code changes
# 2. Test locally
npm run dev

# 3. Deploy to GitHub Pages
npm run deploy

# 4. Wait 1-2 minutes
# 5. Refresh browser
# ✅ Changes are live!
```

---

## ⚠️ Important Notes

### Environment Variables

GitHub Pages is **static hosting** - no server-side code!

**Your .env file won't work on GitHub Pages!**

Instead:
1. Environment variables are bundled at BUILD time
2. Supabase keys are included in the built code
3. This is OK because:
   - ✅ Using anon key (public)
   - ✅ RLS policies protect data
   - ✅ No secrets exposed

**Make sure .env is committed** or set environment variables in build:
```bash
# Option 1: Commit .env (OK for anon key)
git add .env
git commit -m "Add Supabase config"

# Option 2: Set in GitHub Actions (advanced)
# Not needed for now since gh-pages builds locally
```

---

## 🔒 Security Checklist

Before deploying:

- [x] ✅ Using Supabase anon key (not service_role key)
- [x] ✅ RLS policies enabled on all tables
- [x] ✅ No service_role key in code
- [x] ✅ No passwords or secrets in .env
- [x] ✅ .gitignore excludes sensitive files

**Current .env**:
```env
VITE_SUPABASE_URL=https://tlgzztlymohzxrrybpuu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (anon key - safe to expose)
```

✅ Safe to deploy!

---

## 🐛 Troubleshooting

### Issue 1: 404 on Refresh

**Problem**: Refreshing page shows 404

**Solution**: GitHub Pages doesn't support client-side routing

**Fix**: Add 404.html redirect
```bash
cp dist/index.html dist/404.html
```

Or use hash routing in React Router.

---

### Issue 2: Assets Not Loading

**Problem**: CSS/JS files show 404

**Cause**: Wrong base path in vite.config.ts

**Fix**: Ensure base matches repo name
```typescript
base: '/OKR-Management/'  // Must match exactly!
```

---

### Issue 3: Supabase Not Working

**Problem**: Can't connect to Supabase

**Check**:
1. Is .env committed? `git ls-files .env`
2. Are variables prefixed with `VITE_`?
3. Check browser console for errors
4. Verify Supabase URL in Network tab

**Fix**: Ensure .env is in repository
```bash
git add .env
git commit -m "Add Supabase config"
git push
npm run deploy
```

---

### Issue 4: Build Fails

**Problem**: `npm run deploy` fails

**Check console output**:
- TypeScript errors?
- Missing dependencies?
- Syntax errors?

**Fix**:
```bash
# Check build locally first
npm run build

# If successful, try deploy again
npm run deploy
```

---

## 📊 Deployment Status Check

After deploy, verify:

### 1. GitHub Pages Status
```
Go to: https://github.com/long-dx-gh/OKR-Management/deployments
Look for: Green checkmark ✅
```

### 2. Live App Check
```
URL: https://long-dx-gh.github.io/OKR-Management/
Test:
  ✅ Page loads
  ✅ Can login
  ✅ Can create objectives
  ✅ Supabase works
```

### 3. Console Check
```
Open DevTools (F12)
Check:
  ✅ No 404 errors
  ✅ No CORS errors
  ✅ Supabase connects
```

---

## 🎯 Custom Domain (Optional)

Want to use custom domain like `okr.yourdomain.com`?

### Steps:

1. **Add CNAME file to public/**
   ```bash
   echo "okr.yourdomain.com" > public/CNAME
   ```

2. **Configure DNS**
   - Add CNAME record: `okr` → `long-dx-gh.github.io`

3. **Enable in GitHub**
   - Settings → Pages → Custom domain
   - Enter: `okr.yourdomain.com`
   - Wait for DNS check ✅

4. **Deploy**
   ```bash
   npm run deploy
   ```

---

## 📝 Deployment Checklist

Before first deploy:

- [x] Install gh-pages: `npm install --save-dev gh-pages`
- [x] Add deploy scripts to package.json
- [x] Set base path in vite.config.ts
- [x] Commit .env file (or handle differently)
- [ ] Run `npm run deploy`
- [ ] Enable GitHub Pages in repo settings
- [ ] Wait for deployment
- [ ] Test live URL
- [ ] ✅ Done!

---

## 🔄 CI/CD (Advanced - Optional)

Auto-deploy on every push using GitHub Actions:

**Create**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Benefit**: Auto-deploy on every `git push`!

---

## 📞 Support

### If Deploy Fails:

1. Check console output for errors
2. Verify all files committed: `git status`
3. Check GitHub Actions logs (if using CI/CD)
4. Review troubleshooting section above

### Common Commands:

```bash
# Build locally
npm run build

# Preview build
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Check git status
git status

# Force push (if needed)
git push origin main --force
```

---

## ✅ Success Criteria

Deployment is successful when:

1. ✅ `npm run deploy` completes without errors
2. ✅ GitHub shows green deployment status
3. ✅ App loads at: https://long-dx-gh.github.io/OKR-Management/
4. ✅ Can login with Supabase credentials
5. ✅ Can create and view objectives
6. ✅ All features work as expected

---

## 🎊 Post-Deployment

After successful deploy:

1. **Share the URL**
   - https://long-dx-gh.github.io/OKR-Management/

2. **Update README**
   - Add live demo link

3. **Test All Features**
   - Login/signup
   - Create objectives
   - Add key results
   - Real-time updates

4. **Monitor**
   - Check for errors
   - Monitor Supabase usage
   - Gather user feedback

---

## 📚 Resources

- GitHub Pages Docs: https://docs.github.com/en/pages
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- gh-pages Package: https://www.npmjs.com/package/gh-pages

---

**Ready to deploy? Run: `npm run deploy`** 🚀
