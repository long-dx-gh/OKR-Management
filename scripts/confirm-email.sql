-- Quick Fix: Confirm Email for User
-- Run this in Supabase SQL Editor
-- URL: https://app.supabase.com/project/tlgzztlymohzxrrybpuu/sql/new

-- Step 1: Check current status
SELECT 
  id, 
  email, 
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'longsctn55@gmail.com';

-- Step 2: Confirm the email
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(), 
  confirmed_at = NOW()
WHERE email = 'longsctn55@gmail.com';

-- Step 3: Verify it worked
SELECT 
  id, 
  email, 
  email_confirmed_at,
  confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
    ELSE '❌ Not Confirmed'
  END as status
FROM auth.users 
WHERE email = 'longsctn55@gmail.com';
