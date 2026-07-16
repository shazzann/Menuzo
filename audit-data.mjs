import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jzlfjrwhfcjcqeyculbd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk'
);

async function runAudit() {
  const report = {};
  
  // 1. Shops table
  const { data: shops, error: shopsError } = await supabase.from('shops').select('*');
  report.shops = { count: shops?.length || 0, error: shopsError?.message || null, sample: shops?.slice(0,1) || null };
  
  // 2. Food items
  const { data: foods, error: foodsError } = await supabase.from('food_items').select('*');
  report.food_items = { count: foods?.length || 0, error: foodsError?.message || null, sample: foods?.slice(0,1) || null };
  
  // 3. Profiles
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
  report.profiles = { count: profiles?.length || 0, error: profilesError?.message || null, sample: profiles?.slice(0,1) || null };

  // Note: we can also check for duplicate shops or food_items by ID (though ID is PK so duplicates shouldn't happen)
  
  // Check for orphan food items
  let orphanFoods = 0;
  if (foods && shops) {
      const shopIds = new Set(shops.map(s => s.id));
      orphanFoods = foods.filter(f => !shopIds.has(f.shop_id)).length;
  }
  report.orphan_foods = orphanFoods;
  
  // Check for empty usernames
  let emptyUsernames = 0;
  if (shops) {
      emptyUsernames = shops.filter(s => !s.username).length;
  }
  report.emptyUsernames = emptyUsernames;

  console.log(JSON.stringify(report, null, 2));
}

runAudit();
