# 🚀 Quick Start: V1 Feature #1 - Comments & Activity Feed

## ⚡ 5-Minute Setup Guide

---

## Step 1: Deploy Database Schema (2 minutes)

### Option A: Supabase Dashboard
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **"New Query"**
5. Copy content from `supabase-v1-comments.sql`
6. Paste into editor
7. Click **"Run"** (or press Cmd/Ctrl + Enter)
8. ✅ You should see: "Success. No rows returned"

### Option B: Command Line (if you have Supabase CLI)
```bash
supabase db push
```

---

## Step 2: Verify Tables Created (30 seconds)

Run this in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('comments', 'comment_reactions', 'activities');
```

✅ **Expected Result**: 3 rows
- `comments`
- `comment_reactions`
- `activities`

---

## Step 3: Enable Realtime (30 seconds)

Run this in SQL Editor:
```sql
-- Already included in schema, but verify:
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

✅ **Expected**: Should see `comments`, `comment_reactions`, `activities`

If not, run:
```sql
ALTER PUBLICATION supabase_realtime 
  ADD TABLE comments, comment_reactions, activities;
```

---

## Step 4: Test Insert (1 minute)

```sql
-- Get your user ID
SELECT id FROM auth.users LIMIT 1;

-- Get an objective ID
SELECT id FROM objectives LIMIT 1;

-- Insert test comment (replace IDs)
INSERT INTO comments (objective_id, user_id, content)
VALUES (
  '[your-objective-id]',
  '[your-user-id]',
  'This is a test comment!'
);

-- Verify
SELECT * FROM comments ORDER BY created_at DESC LIMIT 1;
```

✅ **Expected**: Comment inserted successfully

---

## Step 5: Deploy to Production (1 minute)

```bash
cd /Users/daoxuanlong/Downloads/OKR

# Build
npm run build

# Deploy to GitHub Pages
npm run deploy
```

Wait for deployment (1-2 minutes)

---

## Step 6: Test on Production (2 minutes)

1. Open: https://long-dx-gh.github.io/OKR-Management/
2. Login with your account
3. Open any Objective
4. Scroll to **Comments** section
5. Type a comment and press **Cmd/Ctrl + Enter**
6. ✅ Comment should appear instantly

### Test Real-time:
1. Open app in 2 browser tabs
2. Add comment in Tab 1
3. ✅ Should appear in Tab 2 automatically

### Test Activity Feed:
1. Click **"Hoạt động"** in sidebar
2. ✅ Panel opens on right
3. Create/update something
4. ✅ Activity appears in feed

---

## 🎯 Quick Feature Tour

### Comments
- **Add comment**: Type and press `Cmd/Ctrl + Enter`
- **Reply**: Click "Reply" button
- **Edit**: Click "⋯" → "Edit" (only your comments)
- **Delete**: Click "⋯" → "Delete" (only your comments)
- **React**: Click emoji (👍 ❤️ 🎉 👏)

### Activity Feed
- **Open**: Click "Hoạt động" in sidebar
- **Close**: Click "Hoạt động" again
- **Auto-update**: New activities appear automatically

---

## 🐛 Troubleshooting

### Comments not showing?
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'comments';
```
Should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

### Real-time not working?
```sql
-- Check realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Activities not logging?
```sql
-- Check triggers exist
SELECT tgname FROM pg_trigger WHERE tgname LIKE '%activity%';
```
Should have 6 triggers (3 for objectives, 3 for key_results)

---

## 📊 Test Data (Optional)

Want to populate with test data?

```sql
-- Insert test comments
INSERT INTO comments (objective_id, user_id, content)
SELECT 
  o.id,
  (SELECT id FROM auth.users LIMIT 1),
  'Great progress on this objective!'
FROM objectives o
LIMIT 5;

-- Insert test reactions
INSERT INTO comment_reactions (comment_id, user_id, emoji)
SELECT 
  c.id,
  (SELECT id FROM auth.users LIMIT 1),
  '👍'
FROM comments c
LIMIT 3;
```

---

## ✅ Success Checklist

- [ ] Database schema deployed
- [ ] Tables verified (3 tables)
- [ ] Realtime enabled
- [ ] Test comment inserted
- [ ] App deployed to production
- [ ] Comments working on production
- [ ] Real-time updates working
- [ ] Activity feed showing data
- [ ] Reactions working
- [ ] Edit/delete working

---

## 🎉 You're Done!

Feature is live and ready to use!

### Next Steps:
1. Invite team members to test
2. Monitor for issues
3. Gather feedback
4. Plan next feature

---

## 📞 Need Help?

Check these files:
- Full guide: `V1_FEATURE_1_COMPLETE.md`
- Summary: `V1_FEATURE_1_SUMMARY.md`
- SQL schema: `supabase-v1-comments.sql`

---

**Estimated Total Time**: 5-10 minutes ⏱️

**Difficulty**: 🟢 Easy (mostly copy-paste)
