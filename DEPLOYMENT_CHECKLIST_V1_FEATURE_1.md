# ✅ V1 Feature #1 - Deployment Checklist

**Feature**: Team Collaboration Suite (Comments & Activity Feed)  
**Status**: Ready for deployment  
**Estimated Time**: 10 minutes

---

## 📋 Pre-Deployment

- [x] Code committed (`0aa52c5`)
- [x] Build successful (525 KB)
- [x] Documentation complete
- [x] No TypeScript errors
- [x] No breaking changes

---

## 🚀 Deployment Steps

### Step 1: Deploy Database (5 min)

```
1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to: SQL Editor
4. Open file: supabase-v1-comments.sql
5. Copy ALL content
6. Paste in SQL Editor
7. Click "Run"
8. ✅ Success message should appear
```

**Verify**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('comments', 'comment_reactions', 'activities');
```
Expected: 3 rows ✅

---

### Step 2: Deploy App (3 min)

```bash
cd /Users/daoxuanlong/Downloads/OKR
npm run build
npm run deploy
```

**Wait**: 1-2 minutes for GitHub Pages

---

### Step 3: Test on Production (2 min)

**URL**: https://long-dx-gh.github.io/OKR-Management/

**Test Checklist**:
- [ ] Login successful
- [ ] Open an objective
- [ ] See "Comments" section
- [ ] Add a comment (Cmd/Ctrl + Enter)
- [ ] Comment appears
- [ ] Click "Reply" → add reply
- [ ] Reply appears nested
- [ ] Click emoji reaction (👍)
- [ ] Reaction added
- [ ] Click "Hoạt động" in sidebar
- [ ] Activity feed opens
- [ ] Activities displayed

**Real-time Test**:
- [ ] Open app in 2 tabs
- [ ] Add comment in Tab 1
- [ ] Comment appears in Tab 2 (instant)

---

## ✅ Post-Deployment

- [ ] No console errors (press F12)
- [ ] Comments working on mobile
- [ ] Activity feed scrollable
- [ ] All icons displaying
- [ ] Timestamps showing correctly

---

## 🐛 If Issues Occur

### Comments not showing?
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'comments';
```
Should have 4 policies ✅

### Real-time not working?
1. Check browser console for WebSocket errors
2. Verify Realtime is enabled in Supabase Dashboard
3. Check network tab for `wss://` connections

### Database errors?
1. Check Supabase logs (Database → Logs)
2. Verify all triggers created:
```sql
SELECT tgname FROM pg_trigger WHERE tgname LIKE '%activity%';
```
Should have 6 triggers ✅

---

## 📞 Quick Links

- **Supabase Dashboard**: https://app.supabase.com
- **Production App**: https://long-dx-gh.github.io/OKR-Management/
- **Full Guide**: V1_FEATURE_1_COMPLETE.md
- **Quick Start**: V1_FEATURE_1_QUICKSTART.md
- **SQL Schema**: supabase-v1-comments.sql

---

## 🎉 Success!

When all checkboxes are checked, feature is live! 🚀

**Next**: Gather user feedback and plan V1 Feature #2

---

**Total Time**: ~10 minutes ⏱️  
**Difficulty**: 🟢 Easy
