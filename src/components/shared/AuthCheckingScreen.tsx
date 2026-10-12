import { Loader2 } from 'lucide-react';

// Shown while a saved sign-in is confirmed, so returning owners are not offered a
// second Google sign-in before their existing session is restored.
export function AuthCheckingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground" role="status">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <p className="text-sm">Checking your sign-in…</p>
    </div>
  );
}
