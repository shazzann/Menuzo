import { useEffect } from 'react';
import { ArrowLeft, ChefHat, Sparkles, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';
import { useApp } from '@/store';

export function FoodDetailPage() {
  const { state, dispatch } = useApp();
  const { selectedFoodItem, shop } = state;

  let backView: 'customer-menu' | 'admin-preview' | 'admin-add-food' = 'customer-menu';
  if (state.currentView === 'admin-food-detail') backView = 'admin-preview';
  if (state.currentView === 'admin-add-food-detail') backView = 'admin-add-food';

  // Redirect back if no food item is selected — must be in useEffect, not during render
  useEffect(() => {
    if (!selectedFoodItem) {
      dispatch({ type: 'SET_VIEW', payload: backView });
    }
  }, [selectedFoodItem, backView, dispatch]);

  useSEO({
    title: selectedFoodItem ? `${selectedFoodItem.name} | ${shop.name}` : shop.name,
    description: selectedFoodItem?.description || selectedFoodItem?.tagline || shop.description,
    image: selectedFoodItem?.image || shop.logo,
  });

  if (!selectedFoodItem) {
    return null;
  }

  const item = selectedFoodItem;
  const discountPercent = item.discount
    ? Math.round(((item.originalPrice - item.finalPrice) / item.originalPrice) * 100)
    : 0;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.name} from ${shop.name}`,
          text: `Check out ${item.name} at ${shop.name}!`,
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

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
          onClick={() => dispatch({ type: 'SET_VIEW', payload: backView })}
          className="absolute top-4 left-4 p-2.5 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Actions & Badges */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {item.isSpecialOffer && (
            <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-primary text-primary-foreground rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Our Special
            </span>
          )}
          {!item.isAvailable && (
            <span className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-muted text-muted-foreground rounded-full">
              Unavailable
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
                    Rs. {item.originalPrice.toFixed(2)}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    Rs. {item.finalPrice.toFixed(2)}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-destructive/20 text-destructive rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              ) : (
                <p className="text-2xl font-bold">
                  Rs. {item.finalPrice.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
              <ChefHat className="w-4 h-4" />
              {item.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            {item.description}
          </p>



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

        </div>
      </div>
    </div>
  );
}


