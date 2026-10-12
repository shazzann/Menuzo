import { supabase } from '@/lib/supabase';

export const AuthService = {
  // Shop owners sign up and sign in with Google only (enforced for shop creation in the database).
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login',
        // Let people pick an account without re-approving access on every sign-in;
        // forcing consent made Google email "You shared some Google Account data" each time.
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) throw error;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }
};
