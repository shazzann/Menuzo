import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzlfjrwhfcjcqeyculbd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bGZqcndoZmNqY3FleWN1bGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMTAyNzcsImV4cCI6MjA5ODc4NjI3N30.zIec4Ta06vxz7Il2SenRL-GsK5B0r7WNPdPVPDpWbnk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkShopStats() {
  const { data, error } = await supabase.from('shops').select('id, name, view_count, qr_scan_count').limit(1);
  if (error) {
    console.error('Error fetching shops:', error);
  } else {
    console.log('Shops stats:', data);
    if (data && data.length > 0) {
      const shop = data[0];
      const { error: rpcError } = await supabase.rpc('increment_shop_visits', {
        p_shop_id: shop.id,
        p_is_qr: true
      });
      if (rpcError) {
        console.error('RPC Error:', rpcError);
      } else {
        console.log('RPC succeeded!');
      }
    }
  }
}

checkShopStats();
