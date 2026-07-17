import { Clock, MapPin, Phone, Store, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Shop } from '@/types';
import { checkShopStatus } from '@/lib/timeUtils';

interface ShopHeaderProps {
  shop: Shop;
  variant?: 'full' | 'compact';
}

export function ShopHeader({ shop, variant = 'full' }: ShopHeaderProps) {
  const timeStatus = checkShopStatus(shop.openingHours);
  const isCurrentlyOpen = shop.isOpen && timeStatus.isOpen;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Store className="w-6 h-6 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg truncate">{shop.name}</h2>
            <span
              className={cn(
                'px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full flex-shrink-0',
                isCurrentlyOpen
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {isCurrentlyOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{shop.tagline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="h-48 md:h-64 bg-muted relative overflow-hidden">
        {shop.banner ? (
          <img
            src={shop.banner}
            alt="Shop banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span>No Banner Uploaded</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4 border-b border-border pb-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-background bg-card shadow-lg overflow-hidden flex items-center justify-center">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-10 h-10 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl">{shop.name}</h1>
              <span
                className={cn(
                  'px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full',
                  isCurrentlyOpen
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {isCurrentlyOpen ? 'Open' : 'Closed'}
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
            <span>
              {isCurrentlyOpen 
                ? (timeStatus.nextActionTime ? `Open until ${timeStatus.nextActionTime}` : 'Open Now') 
                : 'Closed Now'}
              {timeStatus.reason && ` (${timeStatus.reason})`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
