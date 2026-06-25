import { useState } from 'react';
import { LogOut, Plus, Search, MoreVertical, Edit2, Trash2, Star, Check, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import type { AdminTab, FoodItem } from '@/types';
import { cn } from '@/lib/utils';

export function AdminAddFoodPage() {
  const { state, dispatch } = useApp();
  const { foodItems, categories } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: '',
    description: '',
    tagline: '',
    category: 'mains',
    image: '/food-burger.jpg',
    originalPrice: 0,
    discountedPrice: 0,
    finalPrice: 0,
    isSpecialOffer: false,
    isAvailable: true,
  });

  const filteredItems = foodItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (item?: FoodItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        tagline: '',
        category: 'mains',
        image: '/food-burger.jpg',
        originalPrice: 0,
        discountedPrice: 0,
        finalPrice: 0,
        isSpecialOffer: false,
        isAvailable: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.originalPrice) return;

    const finalPrice = formData.discountedPrice ? formData.discountedPrice : formData.originalPrice;
    const discount = formData.discountedPrice ? Math.round(((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100) : 0;

    const itemData: FoodItem = {
      id: editingItem?.id || `item-${Date.now()}`,
      name: formData.name || '',
      description: formData.description || '',
      tagline: formData.tagline || '',
      category: formData.category || 'mains',
      image: formData.image || '/food-burger.jpg',
      originalPrice: formData.originalPrice || 0,
      discountedPrice: formData.discountedPrice || 0,
      discount: discount,
      finalPrice: Number(finalPrice.toFixed(2)),
      isSpecialOffer: formData.isSpecialOffer || false,
      isAvailable: formData.isAvailable ?? true,
    };

    if (editingItem) {
      dispatch({ type: 'UPDATE_FOOD_ITEM', payload: itemData });
    } else {
      dispatch({ type: 'ADD_FOOD_ITEM', payload: itemData });
    }

    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_FOOD_ITEM', payload: id });
  };

  const handleTabChange = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
    switch (tab) {
      case 'menu-preview':
        dispatch({ type: 'SET_VIEW', payload: 'admin-preview' });
        break;
      case 'shop-details':
        dispatch({ type: 'SET_VIEW', payload: 'admin-shop-details' });
        break;
      case 'analytics':
        dispatch({ type: 'SET_VIEW', payload: 'admin-analytics' });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground">M</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm">Menu Items</h1>
              <p className="text-xs text-muted-foreground">Manage your dishes</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Add */}
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-card card-border text-center">
            <p className="text-2xl font-bold">{foodItems.length}</p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </div>
          <div className="p-3 rounded-xl bg-card card-border text-center">
            <p className="text-2xl font-bold text-primary">
              {foodItems.filter((i) => i.isSpecialOffer).length}
            </p>
            <p className="text-xs text-muted-foreground">Specials</p>
          </div>
          <div className="p-3 rounded-xl bg-card card-border text-center">
            <p className="text-2xl font-bold text-destructive">
              {foodItems.filter((i) => !i.isAvailable).length}
            </p>
            <p className="text-xs text-muted-foreground">Unavailable</p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="px-4 space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-4 p-3 rounded-2xl bg-card card-border card-shadow',
              !item.isAvailable && 'opacity-60'
            )}
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover rounded-xl"
              />
              {item.isSpecialOffer && (
                <span className="absolute -top-1 -left-1 p-1 rounded-full bg-primary">
                  <Star className="w-2.5 h-2.5 text-primary-foreground" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{item.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.tagline}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold">${item.finalPrice.toFixed(2)}</span>
                {(item.discountedPrice ?? 0) > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded-full">
                    Sale
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_FOOD_ITEM',
                      payload: { ...item, isSpecialOffer: !item.isSpecialOffer },
                    })
                  }
                >
                  <Star className="w-4 h-4 mr-2" />
                  {item.isSpecialOffer ? 'Remove Special' : 'Mark as Special'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_FOOD_ITEM',
                      payload: { ...item, isAvailable: !item.isAvailable },
                    })
                  }
                >
                  {item.isAvailable ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Mark Unavailable
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mark Available
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Image */}
            <div className="relative h-40 rounded-xl overflow-hidden bg-muted group">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload Photo</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, image: URL.createObjectURL(file) });
                    }
                  }}
                />
              </label>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Item name"
              />
            </div>

            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Short catchy phrase"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item"
                rows={2}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border"
              >
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Discounted Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountedPrice || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00 (Optional)"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <div>
                <p className="font-medium text-sm">Special Offer</p>
                <p className="text-xs text-muted-foreground">Highlight on menu</p>
              </div>
              <Switch
                checked={formData.isSpecialOffer}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isSpecialOffer: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <div>
                <p className="font-medium text-sm">Available</p>
                <p className="text-xs text-muted-foreground">Show on menu</p>
              </div>
              <Switch
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAvailable: checked })
                }
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="add-food"
        onTabChange={handleTabChange}
        isAdmin={true}
      />
    </div>
  );
}
