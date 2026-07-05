import { ArrowLeft, Clock, ChefHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { cn } from '@/lib/utils';

export function FoodDetailPage() {
  const { state, dispatch } = useApp();
  const { selectedFoodItem, shop } = state;

  if (!selectedFoodItem) {
    dispatch({ type: 'SET_VIEW', payload: 'customer-menu' });
    return null;
  }

  const item = selectedFoodItem;
  const discountPercent = item.discount
    ? Math.round(((item.originalPrice - item.finalPrice) / item.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Image Header */}
      <div className="relative h-72">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'customer-menu' })}
          className="absolute top-4 left-4 p-2.5 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {item.isSpecialOffer && (
            <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-primary text-primary-foreground rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Special Offer
            </span>
          )}
          {!item.isAvailable && (
            <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-muted text-muted-foreground rounded-full">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-6 px-4 pb-8">
        <div className="bg-card rounded-3xl card-border card-shadow p-5">
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold">{item.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{item.tagline}</p>
            </div>
            <div className="text-right">
              {item.discount ? (
                <>
                  <p className="text-sm text-muted-foreground line-through">
                    LKR {item.originalPrice.toFixed(2)}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    LKR {item.finalPrice.toFixed(2)}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-destructive/20 text-destructive rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              ) : (
                <p className="text-2xl font-bold">
                  LKR {item.finalPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            {item.description}
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">15-20 min</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
              <ChefHat className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{categories.find(c => c.id === item.category)?.name}</span>
            </div>
          </div>



          {/* Shop Info */}
          <div className="p-4 rounded-xl bg-muted/50 mb-6">
            <div className="flex items-center gap-3">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {shop.name ? shop.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{shop.name}</p>
                <p className="text-xs text-muted-foreground">{shop.tagline}</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            disabled={!item.isAvailable}
            className={cn(
              'w-full py-6 text-base font-semibold',
              item.isAvailable
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {item.isAvailable ? 'Ask Staff About This Item' : 'Currently Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const categories = [
  { id: 'all', name: 'All' },
  { id: 'starters', name: 'Starters' },
  { id: 'mains', name: 'Mains' },
  { id: 'bowls', name: 'Bowls' },
  { id: 'desserts', name: 'Desserts' },
];
