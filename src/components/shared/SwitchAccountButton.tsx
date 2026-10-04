import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/store';
import { toast } from 'sonner';

export function SwitchAccountButton() {
  const { state, dispatch } = useApp();
  const [busy, setBusy] = useState(false);
  const switchAccount = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_VIEW', payload: 'login' });
    } catch {
      toast.error('Could not switch accounts. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return <Button variant="ghost" size="sm" onClick={switchAccount} disabled={busy} title={state.user?.email}>
    {busy ? 'Signing out…' : 'Switch account'}
  </Button>;
}
