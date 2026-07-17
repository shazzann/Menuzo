import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const check = async () => { 
  const {data, error} = await supabase.from('shops').select('*').eq('username', 'spicegardenkitchen').limit(1).maybeSingle(); 
  console.log('Data:', data?.name, 'Error:', error); 
}; 
check();
