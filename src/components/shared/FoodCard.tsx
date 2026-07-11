import { cn } from '@/lib/utils';
import type { FoodItem } from '@/types';

interface FoodCardProps {
  item: FoodItem;
  onClick?: () => void;
  variant?: 'grid' | 'list';
}

export function FoodCard({ item, onClick, variant = 'grid' }: FoodCardProps) {
  const discountPercent = item.discount 
    ? Math.round(((item.originalPrice - item.finalPrice) / item.originalPrice) * 100)
    : 0;

  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center gap-4 p-3 rounded-2xl bg-card card-border card-shadow',
          onClick && 'cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-primary/30',
          !item.isAvailable && 'opacity-60'
        )}
      >
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-xl"
          />
          {item.isSpecialOffer && (
            <span className="absolute -top-1 -left-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
              Our Special
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{item.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {item.description}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            {item.discount ? (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  Rs. {item.originalPrice.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-primary">
                  Rs. {item.finalPrice.toFixed(2)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded-full">
                  -{discountPercent}%
                </span>
              </>
            ) : (
              <span className="text-sm font-bold">
                Rs. {item.finalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        {!item.isAvailable && (
          <span className="px-2 py-1 text-[10px] font-mono uppercase bg-muted text-muted-foreground rounded-full">
            Sold Out
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-2xl bg-card card-border card-shadow overflow-hidden',
        onClick && 'cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:border-primary/30',
        !item.isAvailable && 'opacity-60'
      )}
    >
      <div className="relative aspect-square">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.isSpecialOffer && (
          <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
            Our Special
          </span>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="px-3 py-1.5 text-xs font-mono uppercase bg-muted text-muted-foreground rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {item.tagline}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {item.discount ? (
            <>
              <span className="text-xs text-muted-foreground line-through">
                Rs. {item.originalPrice.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-primary">
                Rs. {item.finalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">
              Rs. {item.finalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
