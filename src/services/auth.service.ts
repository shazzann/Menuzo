import { supabase } from '@/lib/supabase';

// Google's account picker names the site it returns to. Going to Google from our own
// domain (instead of through Supabase's callback) makes it say menuzo.lk, not *.supabase.co.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GOOGLE_SIGNIN_KEY = 'menuzo_google_signin';

const randomHex = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

let googleRedirect: Promise<string> | undefined;

// Resolves to an error message ('' when there is none) once a Google sign-in redirect is handled.
async function completeGoogleRedirect(): Promise<string> {
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (!params.has('state') || !(params.has('id_token') || params.has('error'))) return '';
  // Drop the token from the address bar before anything can copy or share it.
  history.replaceState(history.state, '', window.location.pathname + window.location.search);
  const saved = sessionStorage.getItem(GOOGLE_SIGNIN_KEY);
  sessionStorage.removeItem(GOOGLE_SIGNIN_KEY);
  const { nonce, state } = saved ? JSON.parse(saved) as { nonce?: string; state?: string } : {};
  if (!nonce || params.get('state') !== state) return 'Google sign-in expired. Please try again.';
  if (params.has('error')) return params.get('error') === 'access_denied' ? '' : 'Could not sign in with Google. Please try again.';
  // Supabase hashes the raw nonce and checks it against the one Google put in the token.
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: params.get('id_token')!, nonce });
  return error ? error.message || 'Could not sign in with Google. Please try again.' : '';
}

export const AuthService = {
  // Shop owners sign up and sign in with Google only (enforced for shop creation in the database).
  async signInWithGoogle(returnPath = '/login') {
    if (!GOOGLE_CLIENT_ID) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + returnPath,
          // Let people pick an account without re-approving access on every sign-in;
          // forcing consent made Google email "You shared some Google Account data" each time.
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
      return;
    }
    const nonce = randomHex();
    const state = randomHex();
    sessionStorage.setItem(GOOGLE_SIGNIN_KEY, JSON.stringify({ nonce, state }));
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin + returnPath,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: await sha256Hex(nonce),
      state,
      prompt: 'select_account',
    });
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  },

  // Safe to call from anywhere: the redirect is handled once and every caller shares the result.
  finishGoogleRedirect() {
    googleRedirect ??= completeGoogleRedirect().catch((err: unknown) =>
      err instanceof Error ? err.message : 'Could not sign in with Google. Please try again.');
    return googleRedirect;
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
