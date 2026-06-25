import { UtensilsCrossed, Store, PlusCircle, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminTab } from '@/types';

interface BottomNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isAdmin?: boolean;
}

const customerTabs = [
  { id: 'menu-preview' as AdminTab, label: 'Menu', icon: UtensilsCrossed },
  { id: 'shop-details' as AdminTab, label: 'Shop Details', icon: Store },
];

const adminTabs = [
  { id: 'menu-preview' as AdminTab, label: 'Menu Card', icon: UtensilsCrossed },
  { id: 'shop-details' as AdminTab, label: 'Shop Details', icon: Store },
  { id: 'add-food' as AdminTab, label: 'Add Food', icon: PlusCircle },
  { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart2 },
];

export function BottomNav({ activeTab, onTabChange, isAdmin = false }: BottomNavProps) {
  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive && 'scale-110'
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
