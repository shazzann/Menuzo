import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Store, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import { AuthService } from '@/services';
import { toast } from 'sonner';

export function SignupPage() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('signup_started', { method: 'email' });
    setLoading(true);
    
    try {
      // 1. Create Auth User
      const authData = await AuthService.signUp(
        formData.email,
        formData.password,
        'Pending',
        'Pending'
      );

      const userId = authData.user?.id;
      if (!userId) throw new Error("Could not create user account.");

      // Ensure the user is fully logged in before creating the shop (bypasses some RLS issues)
      if (!authData.session) {
        try {
          await AuthService.signIn(formData.email, formData.password);
        } catch (signInErr: any) {
          throw new Error("Account created, but could not sign in. Please ensure email confirmation is not required: " + signInErr.message);
        }
      }

      trackEvent('signup_completed', { email: formData.email });
      
      // Update global state with the new user context
      dispatch({ 
        type: 'LOGIN', 
        payload: {
          id: userId,
          email: formData.email,
          shopName: '',
          shopId: '',
          subscription: { plan: 'free', expiresAt: new Date('2025-12-31'), status: 'active' }
        }
      });

      toast.success("Account created successfully!");
      
      // 3. Redirect to Onboarding
      dispatch({ type: 'SET_VIEW', payload: 'onboarding' });

    } catch (error: any) {
      toast.error(error.message || "An error occurred during signup.");
    } finally {
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              required
              type="email"
              placeholder="Email Address" 
              className="pl-12 h-12"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              required
              type="password"
              placeholder="Password" 
              className="pl-12 h-12"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <Button type="submit" className="w-full h-12 text-lg font-bold mt-4" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })} className="text-primary font-semibold hover:underline">Log in</button>
        </div>
      </motion.div>
    </div>
  );
}
