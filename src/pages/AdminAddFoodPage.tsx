import { useState } from 'react';
import { Settings, Plus, Search, MoreVertical, Edit2, Trash2, Star, Check, X, Camera, ArrowLeft, Image as ImageIcon } from 'lucide-react';
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

import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import type { AdminTab, FoodItem } from '@/types';
import type { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { ImageCropperModal } from '@/components/shared/ImageCropperModal';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { CategoryReorderModal } from '@/components/shared/CategoryReorderModal';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { MenuService, CategoryService, StorageService } from '@/services';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AdminAddFoodPage() {
  const { state, dispatch } = useApp();
  const { foodItems, categories } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: '',
    description: '',
    tagline: '',
    category: '',
    image: '',
    originalPrice: 0,
    discountedPrice: 0,
    finalPrice: 0,
    isSpecialOffer: false,
    isAvailable: true,
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenForm = (item?: FoodItem) => {
    setIsCreatingCategory(false);
    setNewCategoryName('');
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        tagline: '',
        category: '',
        image: '',
        originalPrice: 0,
        discountedPrice: 0,
        finalPrice: 0,
        isSpecialOffer: false,
        isAvailable: true,
      });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.originalPrice === undefined) return;

    const finalPrice = formData.discountedPrice ? formData.discountedPrice : formData.originalPrice;
    const discount = formData.discountedPrice ? Math.round(((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100) : 0;

    let finalCategoryName = formData.category || '';
    if (isCreatingCategory && newCategoryName.trim()) {
      finalCategoryName = newCategoryName.trim();
    }
    
    let newItemId = `item-${Date.now()}`;

    try {
      if (state.shop.id && state.shop.id !== 'shop-1') {
        type FoodItemInsert = Database['public']['Tables']['food_items']['Insert'];
        const dbPayload: FoodItemInsert = {
          shop_id: state.shop.id,
          name: formData.name,
          description: formData.description || null,
          tagline: formData.tagline || null,
          image: formData.image || null,
          original_price: formData.originalPrice,
          discount: discount,
          final_price: Number(finalPrice.toFixed(2)),
          is_special_offer: formData.isSpecialOffer,
          is_available: formData.isAvailable ?? true,
          category: finalCategoryName || null
        };

        if (editingItem && !editingItem.id.startsWith('item-')) {
          await MenuService.updateMenuItem(editingItem.id, dbPayload);
        } else {
          const data = await MenuService.addMenuItem(dbPayload);
          if (data) newItemId = data.id;
        }
      }

      let itemData: FoodItem = {
        id: editingItem?.id || newItemId,
        name: formData.name || '',
        description: formData.description || '',
        tagline: formData.tagline || '',
        category: finalCategoryName,
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
        trackEvent('menu_item_added', { itemName: itemData.name });
        dispatch({ type: 'ADD_FOOD_ITEM', payload: itemData });
      }

      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving food item:', err);
      toast.error('Failed to save food item.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!id.startsWith('item-') && state.shop.id && state.shop.id !== 'shop-1') {
        await MenuService.deleteMenuItem(id);
      }
      dispatch({ type: 'DELETE_FOOD_ITEM', payload: id });
    } catch (err) {
      console.error('Error deleting food item:', err);
      toast.error('Failed to delete item.');
    }
  };

  const handleToggleQuick = async (item: FoodItem, field: 'isSpecialOffer' | 'isAvailable') => {
    const newValue = !item[field];
    try {
      if (!item.id.startsWith('item-') && state.shop.id && state.shop.id !== 'shop-1') {
        type FoodItemUpdate = Database['public']['Tables']['food_items']['Update'];
        const updatePayload: FoodItemUpdate = field === 'isSpecialOffer' 
          ? { is_special_offer: newValue }
          : { is_available: newValue };
          
        await MenuService.updateMenuItem(item.id, updatePayload);
      }
      dispatch({
        type: 'UPDATE_FOOD_ITEM',
        payload: { ...item, [field]: newValue },
      });
    } catch (err) {
      console.error(`Error toggling ${field}:`, err);
      toast.error('Failed to update item.');
    }
  };

  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
      setCropModalOpen(true);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    toast.loading('Uploading image...', { id: 'upload-food' });
    try {
      const { url } = await StorageService.uploadImage(croppedFile);
      
      const oldUrl = formData.image;
      if (oldUrl && !oldUrl.startsWith('/')) {
        // Simple extraction for path (not perfect but OK for MVP)
        const path = oldUrl.split('restaurant-assets/')[1];
        if (path) await StorageService.deleteImage(path);
      }

      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully', { id: 'upload-food' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image', { id: 'upload-food' });
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove this image?')) return;
    const oldUrl = formData.image;
    if (oldUrl && !oldUrl.startsWith('/')) {
      const path = oldUrl.split('restaurant-assets/')[1];
      if (path) await StorageService.deleteImage(path);
    }
    setFormData(prev => ({ ...prev, image: '' }));
    toast.success('Image removed.');
  };

  const handleTabChange = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
    switch (tab) {
      case 'dashboard':
        dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
        break;
      case 'menu-preview':
        dispatch({ type: 'SET_VIEW', payload: 'admin-preview' });
        break;
      case 'settings':
        dispatch({ type: 'SET_VIEW', payload: 'admin-settings' });
        break;
      case 'analytics':
        dispatch({ type: 'SET_VIEW', payload: 'admin-analytics' });
        break;
    }
  };

  const handleSaveCategoryOrder = async (newOrder: string[]) => {
    try {
      if (state.shop.id && state.shop.id !== 'shop-1') {
        await CategoryService.updateCategoryOrder(state.shop.id, newOrder);
      }
      
      dispatch({ type: 'UPDATE_SHOP', payload: { categoryOrder: newOrder } });
      setIsReorderModalOpen(false);
      toast.success('Category order saved');
    } catch (err: any) {
      console.error('Error saving category order:', err);
      toast.error('Failed to save category order');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {showForm ? (
        <div className="min-h-screen bg-background pb-24">
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="-ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-semibold">{editingItem ? 'Edit Item' : 'Add New Item'}</h1>
            </div>
          </div>
          <div className="p-4 max-w-md mx-auto">
            <div className="space-y-4 pt-4">
            {/* Image */}
            <div className="relative h-48 rounded-xl overflow-hidden bg-muted group flex items-center justify-center">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs font-medium">No Image Uploaded</span>
                </div>
              )}
              {formData.image && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload Photo</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageSelect}
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
              {isCreatingCategory ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={() => setIsCreatingCategory(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setIsCreatingCategory(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Price (Rs.)</Label>
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
                <Label>Discounted Price (Rs.)</Label>
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
                <p className="font-medium text-sm">Our Special</p>
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
                onClick={() => setShowForm(false)}
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
          </div>
        </div>
      ) : (
        <>
          {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Menu Items</h1>
              <p className="text-xs text-muted-foreground">Manage your dishes</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
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
            onClick={() => handleOpenForm()}
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

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onReorder={() => setIsReorderModalOpen(true)}
        className="top-[60px] mb-4"
      />

      {/* Items List */}
      <div className="px-4 space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              toast.success(`Opening ${item.name}`);
              dispatch({ type: 'SELECT_FOOD_ITEM', payload: item });
              dispatch({ type: 'SET_VIEW', payload: 'admin-add-food-detail' });
            }}
            className={cn(
              'flex items-center gap-4 p-3 rounded-2xl bg-card card-border card-shadow cursor-pointer hover:border-primary/30 transition-all',
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
                {item.category}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold">Rs. {item.finalPrice.toFixed(2)}</span>
                {(item.discountedPrice ?? 0) > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded-full">
                    Offer
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onSelect={() => handleOpenForm(item)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => handleToggleQuick(item, 'isSpecialOffer')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {item.isSpecialOffer ? 'Remove Special' : 'Mark as Special'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={() => handleToggleQuick(item, 'isAvailable')}
                  onClick={(e) => e.stopPropagation()}
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
                  onSelect={() => handleDelete(item.id)}
                  onClick={(e) => e.stopPropagation()}
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

      
        </>
      )}

      <ImageCropperModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        title="Crop Food Image"
      />

      <CategoryReorderModal
        categories={categories}
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        onSave={handleSaveCategoryOrder}
      />


      {/* Bottom Navigation */}
      {!isReorderModalOpen && (
        <BottomNav
          activeTab="add-food"
          onTabChange={handleTabChange}
          isAdmin={true}
        />
      )}
    </div>
  );
}
