import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzlfjrwhfcjcqeyculbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function probeColumns() {
  console.log('Probing profiles table schema...');
  
  const columnsToTest = [
    'id', 
    'email', 
    'username', 
    'role', 
    'subscription_plan', 
    'subscription_status', 
    'created_at', 
    'updated_at',
    'subscription_expires_at'
  ];

  for (const col of columnsToTest) {
    const { error } = await supabase.from('profiles').select(col).limit(1);
    if (error) {
      console.error(`Column '${col}' test failed:`, error.message);
    } else {
      console.log(`Column '${col}' EXISTS.`);
    }
  }
}

probeColumns();
