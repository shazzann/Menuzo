import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jzlfjrwhfcjcqeyculbd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk'
);

async function fix() {
  console.log("Fetching shops to find Spice Garden Kitchen...");
  const { data: shops } = await supabase.from('shops').select('id, name, username');
  
  if (shops) {
    for (const shop of shops) {
      if (shop.name.toLowerCase().replace(/[^a-z0-9]/g, '') === 'spicegardenkitchen') {
        console.log(`Found shop: ${shop.name} (${shop.id}). Updating username to spicegardenkitchen...`);
        const { error } = await supabase.from('shops').update({ username: 'spicegardenkitchen' }).eq('id', shop.id);
        if (error) console.error("Error updating:", error);
        else console.log("Success!");
      }
    }
  }
}

fix();
