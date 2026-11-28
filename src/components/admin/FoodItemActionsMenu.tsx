import { useState } from 'react';
import { CalendarClock, Check, CircleCheck, EyeOff, MoreVertical, Pencil, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { FoodItem } from '@/types';
import { foodAvailability, formatReturnTime, type FoodAvailability } from '@/lib/foodAvailability';

const statusStyle: Record<FoodAvailability, { label: string; className: string; dot: string }> = {
  available: { label: 'Available', className: 'bg-emerald-500/15 text-emerald-500', dot: 'bg-emerald-500' },
  today: { label: 'Sold out today', className: 'bg-amber-500/15 text-amber-500', dot: 'bg-amber-500' },
  off: { label: 'Unavailable', className: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = foodAvailability(item);
  const price = item.pricingType === 'variants' && item.options?.length
    ? `From Rs. ${item.finalPrice.toFixed(2)}` : `Rs. ${item.finalPrice.toFixed(2)}`;

  const options: { value: FoodAvailability; title: string; hint: string; icon: React.ReactNode; tone: string }[] = [
    { value: 'available', title: 'Available', hint: 'Customers can see and order it', icon: <CircleCheck className="h-4 w-4 text-emerald-500" />, tone: 'bg-emerald-500/15' },
    {
      value: 'today', title: 'Sold out for today',
      hint: status === 'today' && item.unavailableUntil
        ? `Back automatically ${formatReturnTime(item.unavailableUntil)}`
        : `Back automatically ${formatReturnTime(soldOutUntil)}`,
      icon: <CalendarClock className="h-4 w-4 text-amber-500" />, tone: 'bg-amber-500/15',
    },
    { value: 'off', title: 'Unavailable', hint: 'Hidden until you turn it back on', icon: <EyeOff className="h-4 w-4 text-muted-foreground" />, tone: 'bg-muted' },
  ];

  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground" aria-label={`Actions for ${item.name}`}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} collisionPadding={12}
          className="w-[19rem] max-w-[calc(100vw_-_1.5rem)] rounded-2xl border-border/70 bg-popover p-1.5 shadow-2xl shadow-black/40">
          {/* Item summary */}
          <div className="flex items-center gap-3 px-2 pb-2.5 pt-1.5">
            <img src={item.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-border/60" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{item.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{price}</span>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[10px] font-semibold', statusStyle[status].className)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle[status].dot)} />{statusStyle[status].label}
                </span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="mx-0" />
          <DropdownMenuLabel className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Availability</DropdownMenuLabel>
          <DropdownMenuGroup role="group" aria-label="Availability">
            {options.map((option) => {
              const selected = status === option.value;
              return (
                <DropdownMenuItem key={option.value} role="menuitemradio" aria-checked={selected}
                  onSelect={() => { if (!selected) onSetAvailability(option.value); }}
                  className={cn('items-start gap-3 rounded-xl px-2 py-2', selected && 'bg-primary/10 focus:bg-primary/15')}>
                  <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', option.tone)}>{option.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-tight">{option.title}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{option.hint}</span>
                  </span>
                  <span className={cn('mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                    {selected && <Check className="!h-2.5 !w-2.5 !text-current" strokeWidth={3} />}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="mx-0 my-1.5" />
          <DropdownMenuItem onSelect={onToggleSpecial} className="gap-3 rounded-xl px-2 py-2">
            <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', item.isSpecialOffer ? 'bg-primary/15' : 'bg-muted')}>
              <Star className={cn('h-4 w-4', item.isSpecialOffer ? 'fill-current text-primary' : 'text-muted-foreground')} />
            </span>
            <span className="flex-1 text-sm">{item.isSpecialOffer ? 'Remove from Specials' : 'Feature as Special'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onEdit} className="gap-3 rounded-xl px-2 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted"><Pencil className="h-4 w-4" /></span>
            <span className="flex-1 text-sm">Edit item</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-0 my-1.5" />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)} className="gap-3 rounded-xl px-2 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10"><Trash2 className="h-4 w-4" /></span>
            <span className="flex-1 text-sm font-medium">Delete item</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
