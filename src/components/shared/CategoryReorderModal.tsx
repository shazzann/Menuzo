import { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategoryReorderModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (newOrder: string[]) => void;
}

function SortableItem({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-3 p-3 bg-card border rounded-xl shadow-sm touch-none",
        isDragging ? "border-primary opacity-80 bg-primary/10 scale-105 shadow-md cursor-grabbing" : "border-border cursor-grab"
      )}
    >
      <GripVertical className="w-5 h-5 text-muted-foreground/50" />
      <span className="flex-1 font-medium text-sm select-none">{id}</span>
    </div>
  );
}

export function CategoryReorderModal({ categories, isOpen, onClose, onSave }: CategoryReorderModalProps) {
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    // Only reorder non-'all' categories
    if (isOpen) {
      setOrder(categories.filter(c => c.id !== 'all').map(c => c.name));
    }
  }, [categories, isOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave(order);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onClose} className="-ml-2 text-muted-foreground">
          Back
        </Button>
        <h2 className="font-semibold text-sm">Category Order</h2>
        <Button variant="ghost" size="sm" onClick={handleSave} className="text-primary font-medium -mr-2">
          Save
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {order.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-10">No categories found.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={order}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {order.map((catName) => (
                  <SortableItem key={catName} id={catName} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
