// Test Supabase Connection
import { supabase } from './src/lib/supabase'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  // Test 1: Check client initialization
  console.log('1️⃣ Supabase Client:', supabase ? '✅ Initialized' : '❌ Failed')
  
  // Test 2: Test authentication
  console.log('\n2️⃣ Testing Authentication...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  console.log('   Session:', session ? '✅ Active' : '⚠️  No active session')
  if (sessionError) console.log('   Error:', sessionError.message)

  // Test 3: Test database connection
  console.log('\n3️⃣ Testing Database Connection...')
  
  // Check if tables exist
  const { data: tables, error: tablesError } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)
  
  if (tablesError) {
    console.log('   ❌ Database Error:', tablesError.message)
    console.log('   Code:', tablesError.code)
    console.log('\n⚠️  POSSIBLE ISSUES:')
    console.log('   - Tables not created (run supabase-schema.sql)')
    console.log('   - RLS policies blocking access')
    console.log('   - Wrong credentials')
  } else {
    console.log('   ✅ Database connected successfully')
  }

  // Test 4: Check user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('\n4️⃣ Current User:', user ? `✅ ${user.email}` : '⚠️  Not logged in')
  if (userError) console.log('   Error:', userError.message)

  // Test 5: Try to fetch objectives
  console.log('\n5️⃣ Testing Fetch Objectives...')
  const { data: objectives, error: objError } = await supabase
    .from('objectives')
    .select('*')
    .limit(5)
  
  if (objError) {
    console.log('   ❌ Error:', objError.message)
    console.log('   Code:', objError.code)
    console.log('   Details:', objError.details)
  } else {
    console.log('   ✅ Success! Found', objectives?.length || 0, 'objectives')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Test completed!')
}

testSupabaseConnection().catch(console.error)
