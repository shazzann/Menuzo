import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FoodItem } from '@/types';

interface SpecialOffersCarouselProps {
  items: FoodItem[];
  onItemClick?: (item: FoodItem) => void;
}

export function SpecialOffersCarousel({ items, onItemClick }: SpecialOffersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="relative py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Our Special</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-card card-border hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-card card-border hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2"
      >
        {items.map((item) => {
          const discountPercent = item.discount
            ? Math.round(((item.originalPrice - item.finalPrice) / item.originalPrice) * 100)
            : 0;

          return (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={cn(
                'flex-shrink-0 w-64 rounded-2xl bg-card card-border card-shadow overflow-hidden first:ml-1',
                'cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-primary/30'
              )}
            >
              <div className="relative h-32">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                  Save {discountPercent}%
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {item.tagline}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground line-through">
                    Rs. {item.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    Rs. {item.finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
