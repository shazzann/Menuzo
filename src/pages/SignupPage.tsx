import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import { AuthService } from '@/services';
import { GoogleIcon } from '@/components/shared/GoogleIcon';
import { toast } from 'sonner';

export function SignupPage() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    trackEvent('signup_started', { method: 'google' });
    setLoading(true);
    try {
      // Redirects to Google; the shared auth listener picks up the session on return.
      await AuthService.signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Could not continue with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create your restaurant</h1>
          <p className="text-muted-foreground">Setup your digital menu in minutes.</p>
        </div>

        <Button type="button" className="w-full h-12 text-base font-semibold" disabled={loading} onClick={handleGoogleSignup}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <GoogleIcon className="w-5 h-5 mr-2" />
              Sign up with Google
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Restaurant accounts use Google sign-in. No password to remember.
        </p>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })} className="text-primary font-semibold hover:underline">Log in</button>
        </div>
      </motion.div>
    </div>
  );
}
