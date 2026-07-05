import { useState } from 'react';
import { useApp } from '@/store';
import { Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CompanyAdminLoginPage() {
  const { dispatch } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      setIsLoading(false);
      dispatch({ type: 'SET_VIEW', payload: 'company-admin' });
      // Update URL without full reload
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/admin/dashboard');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side - Branding & Features */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-muted/30 relative overflow-hidden flex-col justify-between p-8 lg:p-12 border-r border-border/50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Menuzo Admin</span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Master control panel for <span className="text-primary">Menuzo operations.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Securely manage shops, themes, subscription plans, and monitor platform health all in one place.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Centralized Shop Management', desc: 'Monitor active shops, trials, and suspensions.' },
                { title: 'Global Theme & Plan Control', desc: 'Publish themes and configure subscription tiers.' },
                { title: 'Advanced Analytics', desc: 'Track platform revenue and growth metrics.' },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure Internal Portal
          </span>
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" /> End-to-end Encrypted
          </span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative min-h-screen md:min-h-full">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-lg font-bold">Menuzo Admin</span>
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in to the master admin panel</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground ml-1">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@menuzo.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-muted-foreground">Password</label>
                  <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/30 bg-muted/30"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground uppercase">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full py-6 rounded-xl border-border/50 bg-muted/10 hover:bg-muted/30 transition-all font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
                  <path fill="#f25022" d="M1 1h9v9H1z" />
                  <path fill="#7fba00" d="M11 1h9v9h-9z" />
                  <path fill="#00a4ef" d="M1 11h9v9H1z" />
                  <path fill="#ffb900" d="M11 11h9v9h-9z" />
                </svg>
                Sign in with Microsoft
              </Button>
            </form>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
            <span className="mb-2 sm:mb-0">Menuzo Master Admin v1.0.0</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
