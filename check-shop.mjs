import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkShop(username) {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  console.log("Error:", error);
  console.log("Data:", data);
}

checkShop('menuzo513');
