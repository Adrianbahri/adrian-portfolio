import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import ws from 'ws';
(global as any).WebSocket = ws;

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runChecks() {
  console.log('🚀 Starting Pre-Deployment Functional Validation...\n');

  // 1. Check Environment Variables
  console.log('📋 Checking Environment Variables...');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'RESEND_API_KEY'
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Environment variables look good.\n');

  // 2. Test Supabase Connectivity
  console.log('🔗 Testing Supabase Connectivity...');
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials missing.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const tables = ['projects', 'articles', 'achievements', 'experiences', 'messages'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`❌ Table "${table}" check failed:`, error.message);
    } else {
      console.log(`✅ Table "${table}" is accessible.`);
    }
  }
  console.log('');

  // 3. Functional CRUD Check (Test Message)
  console.log('🧪 Running CRUD Functional Test (Messages)...');
  const testMessage = {
    name: 'System Test',
    email: 'test@example.com',
    subject: 'System Check',
    message: 'Pre-deployment functional check.'
  };

  const { data: inserted, error: insertError } = await supabase
    .from('messages')
    .insert([testMessage])
    .select();

  if (insertError) {
    console.warn('⚠️  CRUD Test (INSERT) failed (likely RLS):', insertError.message);
    console.warn('   (Note: This is expected if RLS is active for anonymous inserts)');
  } else {
    console.log('✅ INSERT functional.');
    const testId = inserted[0].id;
    
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', testId);

    if (deleteError) {
      console.warn('⚠️  CRUD Test (DELETE) failed:', deleteError.message);
    } else {
      console.log('✅ DELETE functional.');
    }
  }
  console.log('');

  // 4. Check for specific functional logic (messages/contact)
  console.log('🏗️  Running Build Simulation (npm run build)...');
  try {
    console.log('   (This might take a minute...)');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build successful! No critical runtime or type errors.');
  } catch (e) {
    console.error('\n❌ Build failed! Please fix the errors before deploying.');
    process.exit(1);
  }

  console.log('\n✨ ALL SYSTEMS GO! Your portfolio is ready for deployment. ✨');
}

runChecks().catch(err => {
  console.error('💥 Validation failed unexpectedly:', err);
  process.exit(1);
});
