import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/store';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services';
import { GoogleIcon } from '@/components/shared/GoogleIcon';

export function LoginPage() {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await AuthService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await AuthService.signIn(email, password);
      // App.tsx has a global listener that will catch the login and redirect to the dashboard automatically!
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src="/logo/Logo favicon.png" alt="Menuzo Logo" className="w-16 h-16" />
            </div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your menu
            </p>
          </div>

          {/* Social Login */}
          <div className="grid gap-3">
            <Button className="w-full h-11" onClick={handleGoogleLogin} type="button">
              <GoogleIcon className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Older email/password accounts only; new restaurant accounts use Google. */}
          {showEmailForm ? (
            <div className="mt-6 pt-6 border-t border-border">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@restaurant.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>


                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full bg-primary text-primary-foreground hover:bg-primary/90',
                    isLoading && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Signed up with email and password? Use email instead
            </button>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'signup' })}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
