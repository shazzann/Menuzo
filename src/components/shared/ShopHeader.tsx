import { Clock, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Shop } from '@/types';

interface ShopHeaderProps {
  shop: Shop;
  variant?: 'full' | 'compact';
}

export function ShopHeader({ shop, variant = 'full' }: ShopHeaderProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          <img
            src={shop.logo}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg truncate">{shop.name}</h2>
          <p className="text-xs text-muted-foreground truncate">{shop.tagline}</p>
        </div>
        <span
          className={cn(
            'px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full',
            shop.isOpen
              ? 'bg-primary/20 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {shop.isOpen ? 'Open' : 'Closed'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative h-48 overflow-hidden">
        <img
          src={shop.banner}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
      <div className="relative -mt-16 px-4 pb-4">
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-background bg-muted flex-shrink-0">
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl">{shop.name}</h1>
              <span
                className={cn(
                  'px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full',
                  shop.isOpen
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {shop.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{shop.tagline}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{shop.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{shop.contactNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{shop.openingHours[0].hours}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
