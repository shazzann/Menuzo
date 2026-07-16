import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzlfjrwhfcjcqeyculbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = 'test' + Date.now() + '@example.com';
  console.log('Signing up:', email);
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { full_name: 'Test User' }
    }
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('User created:', userId);
  
  console.log('Checking if profile exists...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error('Profile not found or error:', profileError);
  } else {
    console.log('Profile found:', profileData);
  }
}

test();
