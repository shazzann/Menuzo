import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Check the server before treating a cached browser session as a signed-in user.
// Revisions prevent a slow restore from undoing a later logout/account switch.
export function watchAuthSession(onUser: (user: User | null) => void, onStatus: (loading: boolean, error: string) => void) {
  let active = true;
  let revision = 0;
  let verifiedUserId: string | undefined;
  const verify = async (request: number) => {
    if (!active || request !== revision) return;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!active || request !== revision) return;
      if (error) {
        const invalid = error.name === 'AuthSessionMissingError' || error.status === 401 || error.status === 403
          || ['session_not_found', 'user_not_found', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error.code || '');
        if (!invalid) throw error;
        // Clear only this browser's invalid session; do not revoke other devices.
        const result = await supabase.auth.signOut({ scope: 'local' });
        if (result.error) throw result.error;
        if (!active || request !== revision) return;
        onUser(null);
      } else {
        verifiedUserId = data.user?.id;
        onUser(data.user);
      }
      onStatus(false, '');
    } catch {
      if (active && request === revision) onStatus(false, 'We could not check your sign-in. Please try again.');
    }
  };

  onStatus(true, '');
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (!active) return;
    if (event === 'SIGNED_OUT') {
      revision++;
      verifiedUserId = undefined;
      onUser(null);
      onStatus(false, '');
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      // Tab focus and token renewal repeat these events for the same user.
      // Do not remount their page or reset an in-progress form each time.
      if (event !== 'USER_UPDATED' && verifiedUserId && session?.user.id === verifiedUserId) return;
      const request = ++revision;
      if (session?.user.id !== verifiedUserId) onStatus(true, '');
      // Auth callbacks run under Supabase's session lock. Check outside it.
      setTimeout(() => { void verify(request); }, 0);
    }
  });
  void verify(++revision);
  return () => { active = false; revision++; subscription.unsubscribe(); };
}
