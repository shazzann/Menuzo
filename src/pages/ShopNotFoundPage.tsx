import { Store, ArrowLeft } from 'lucide-react';
import { useApp } from '@/store';

export function ShopNotFoundPage() {
  const { dispatch } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
        <Store className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Shop Not Found</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-sm">
        We couldn't find the menu you're looking for. The shop might not exist or is currently unavailable.
      </p>
      <button
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Return Home
      </button>
    </div>
  );
}
