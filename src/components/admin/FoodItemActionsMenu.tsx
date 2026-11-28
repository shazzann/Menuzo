import { useState } from 'react';
import { CalendarClock, Check, CircleCheck, EyeOff, MoreVertical, Pencil, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { FoodItem } from '@/types';
import { foodAvailability, formatReturnTime, type FoodAvailability } from '@/lib/foodAvailability';

const statusStyle: Record<FoodAvailability, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-emerald-500/15 text-emerald-500' },
  today: { label: 'Sold out today', className: 'bg-amber-500/15 text-amber-500' },
  off: { label: 'Unavailable', className: 'bg-muted text-muted-foreground' },
};

export function FoodAvailabilityBadge({ item, className }: { item: FoodItem; className?: string }) {
  const status = foodAvailability(item);
  if (status === 'available') return null;
  const style = statusStyle[status];
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', style.className, className)}
      title={status === 'today' && item.unavailableUntil ? `Back ${formatReturnTime(item.unavailableUntil)}` : undefined}
    >
      {status === 'today' ? <CalendarClock className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {status === 'today' && item.unavailableUntil ? `Back ${formatReturnTime(item.unavailableUntil)}` : style.label}
    </span>
  );
}

type Props = {
  item: FoodItem;
  // When "Sold out for today" would end: the shop's next opening time.
  soldOutUntil: Date;
  onEdit: () => void;
  onToggleSpecial: () => void;
  onSetAvailability: (status: FoodAvailability) => void;
  onDelete: () => void;
};

export function FoodItemActionsMenu({ item, soldOutUntil, onEdit, onToggleSpecial, onSetAvailability, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = foodAvailability(item);
  // Close the sheet first, then act, so its slide-down and the next view don't overlap.
  const run = (action: () => void) => { setOpen(false); window.setTimeout(action, 180); };

  const options: { value: FoodAvailability; title: string; hint: string; icon: React.ReactNode; tone: string }[] = [
    { value: 'available', title: 'Available', hint: 'Customers can see and order it', icon: <CircleCheck className="h-5 w-5 text-emerald-500" />, tone: 'bg-emerald-500/15' },
    {
      value: 'today', title: 'Sold out for today',
      hint: status === 'today' && item.unavailableUntil
        ? `Back automatically ${formatReturnTime(item.unavailableUntil)}`
        : `Back automatically ${formatReturnTime(soldOutUntil)}`,
      icon: <CalendarClock className="h-5 w-5 text-amber-500" />, tone: 'bg-amber-500/15',
    },
    { value: 'off', title: 'Unavailable', hint: 'Hidden until you turn it back on', icon: <EyeOff className="h-5 w-5 text-muted-foreground" />, tone: 'bg-muted' },
  ];
  const row = 'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]';

  return (
    // The sheet renders in a portal, but React events still bubble to the item card; stop them here.
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label={`Actions for ${item.name}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <MoreVertical className="w-4 h-4" />
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto w-full max-w-lg rounded-t-3xl border-border/60 px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 px-3 pb-3 pt-4">
            <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-border/60" />
            <DrawerTitle className="min-w-0 flex-1 truncate text-base font-semibold">{item.name}</DrawerTitle>
            <DrawerDescription className="sr-only">Change availability, feature, edit or delete this item.</DrawerDescription>
          </div>

          <div role="radiogroup" aria-label="Availability" className="space-y-1">
            {options.map((option) => {
              const selected = status === option.value;
              return (
                <button key={option.value} type="button" role="radio" aria-checked={selected}
                  onClick={() => run(() => { if (!selected) onSetAvailability(option.value); })}
                  className={cn(row, selected && 'bg-primary/10 hover:bg-primary/15')}>
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', option.tone)}>{option.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-tight">{option.title}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{option.hint}</span>
                  </span>
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mx-3 my-2 h-px bg-border/70" />
          <button type="button" className={row} onClick={() => run(onToggleSpecial)}>
            <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', item.isSpecialOffer ? 'bg-primary/15' : 'bg-muted')}>
              <Star className={cn('h-5 w-5', item.isSpecialOffer ? 'fill-current text-primary' : 'text-muted-foreground')} />
            </span>
            <span className="flex-1 text-[15px]">{item.isSpecialOffer ? 'Remove from Specials' : 'Feature as Special'}</span>
          </button>
          <button type="button" className={row} onClick={() => run(onEdit)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"><Pencil className="h-5 w-5 text-muted-foreground" /></span>
            <span className="flex-1 text-[15px]">Edit item</span>
          </button>
          <div className="mx-3 my-2 h-px bg-border/70" />
          <button type="button" className={cn(row, 'text-destructive hover:bg-destructive/10')} onClick={() => run(() => setConfirmDelete(true))}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10"><Trash2 className="h-5 w-5 text-destructive" /></span>
            <span className="flex-1 text-[15px] font-medium">Delete item</span>
          </button>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the item and its options from your menu for good. To hide it for a while instead, mark it Unavailable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep item</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
