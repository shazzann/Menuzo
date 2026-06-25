import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory?: () => void;
  className?: string;
}

export function CategoryTabs({ categories, selectedCategory, onSelectCategory, onAddCategory, className }: CategoryTabsProps) {
  return (
    <div className={cn("sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-3 px-4 border-b border-border", className)}>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground card-border'
            )}
          >
            {category.name}
          </button>
        ))}
        {onAddCategory && (
          <button
            onClick={onAddCategory}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        )}
      </div>
    </div>
  );
}
