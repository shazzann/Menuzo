import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://jzlfjrwhfcjcqeyculbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk';

async function checkOpenAPI() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
  const spec = await response.json();
  
  if (spec.components && spec.components.schemas && spec.components.schemas.profiles) {
      fs.writeFileSync('profiles-schema.json', JSON.stringify(spec.components.schemas.profiles, null, 2));
      console.log('Saved to profiles-schema.json');
  } else if (spec.definitions && spec.definitions.profiles) {
      fs.writeFileSync('profiles-schema.json', JSON.stringify(spec.definitions.profiles, null, 2));
      console.log('Saved to profiles-schema.json');
  } else {
      console.log('Could not find profiles in OpenAPI spec');
      fs.writeFileSync('profiles-schema.json', JSON.stringify(spec, null, 2));
  }
}

checkOpenAPI();
