import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzlfjrwhfcjcqeyculbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnon() {
  console.log('Attempting anonymous sign in...');
  
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

  if (authError) {
    console.error('Anon Auth Error:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('Anon User created successfully:', userId);
  
  console.log('Checking if profile was created by trigger...');
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

testAnon();
