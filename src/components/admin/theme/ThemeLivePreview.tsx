import { useState } from 'react';
import { Eye, EyeOff, Plus, ShoppingBag } from 'lucide-react';
import type { ThemeConfig } from '@/types';
import { getShopThemeStyles, isBrandTheme } from '@/lib/themeUtils';

interface ThemeLivePreviewProps {
  theme: ThemeConfig;
  shopName?: string;
  activeThemeName?: string;
}

export function ThemeLivePreview({ theme, shopName, activeThemeName }: ThemeLivePreviewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const brand = isBrandTheme(theme);

  return (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden p-3.5 sm:p-4 transition-all duration-200">
      {/* Header with Title, Active Theme label & Show/Hide Toggle */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Live Preview
          </p>
          {activeThemeName && (
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 ml-1">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block" 
                style={{ backgroundColor: theme.accent }} 
              />
              {activeThemeName}
            </span>
          )}
        </div>

        {/* Toggle to Show/Hide Preview for mobile convenience */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/60 transition-colors"
          title={isCollapsed ? 'Show live preview' : 'Hide live preview'}
        >
          {isCollapsed ? (
            <>
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Show</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide</span>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Preview Content */}
      {!isCollapsed ? (
        <div 
          className="rounded-xl border bg-background overflow-hidden relative shadow-inner transition-colors duration-200 animate-in fade-in duration-150" 
          data-shop-theme={brand ? 'brand' : 'custom'} 
          style={{ ...getShopThemeStyles(theme), height: '240px' }}
        >
          {/* Header Image & Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80)' }}
          />
          
          {/* Restaurant Title & Stars */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-start justify-between">
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg leading-tight">
                {shopName || 'The Garden Kitchen'}
              </h3>
              <p className="text-white/80 text-[11px] mt-0.5">Fresh artisanal dining & handcrafted beverages</p>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className="w-3 h-3" 
                    style={{ color: theme.accent }} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* View Cart badge / button */}
            <div 
              className="p-1.5 rounded-full text-primary-foreground shadow-md backdrop-blur-xs" 
              style={{ backgroundColor: theme.accent }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          
          {/* Bottom Card & Category Tabs */}
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl z-20 p-3 sm:p-3.5 bg-background border-t border-border/40">
            {/* Category Navigation Pills */}
            <div className="flex gap-1.5 mb-2.5 overflow-hidden">
              <div className="px-2.5 py-0.8 rounded-full text-[10px] font-medium bg-primary text-primary-foreground shadow-2xs">
                All
              </div>
              <div className="px-2.5 py-0.8 rounded-full text-[10px] font-medium border bg-card text-card-foreground">
                Burgers
              </div>
              <div className="px-2.5 py-0.8 rounded-full text-[10px] font-medium border bg-card text-card-foreground">
                Drinks
              </div>
            </div>
            
            {/* Sample Menu Item Card */}
            <div className="rounded-xl p-2.5 flex items-center gap-2.5 shadow-xs border border-border/50 bg-card text-card-foreground">
              <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80)' }} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-xs truncate">Classic Burger</h4>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  Juicy beef patty with fresh lettuce & secret sauce
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold text-xs text-primary">Rs. 1200</span>
                  <span 
                    className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-md font-medium text-primary-foreground"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Plus className="w-2.5 h-2.5" /> Add
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2 px-3 rounded-lg bg-muted/40 border border-dashed border-border/60 text-xs text-muted-foreground flex items-center justify-between">
          <span className="italic">Preview minimized</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.secondary }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
          </div>
        </div>
      )}
    </div>
  );
}
