import { useMemo, useState } from 'react';
import { Settings, Plus, Search, Trash2, Star, Camera, ArrowLeft, Lock, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import { FoodAvailabilityBadge, FoodItemActionsMenu } from '@/components/admin/FoodItemActionsMenu';
import { formatReturnTime, type FoodAvailability } from '@/lib/foodAvailability';
import { nextBusinessDayStart } from '@/lib/timeUtils';
import type { AdminTab, FoodItem, FoodItemOption } from '@/types';
import type { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';
import { ImageCropperModal } from '@/components/shared/ImageCropperModal';
import { CategoryTabs } from '@/components/shared/CategoryTabs';
import { CategoryReorderModal } from '@/components/shared/CategoryReorderModal';
import { trackEvent } from '@/lib/analytics';
import { getPlanLimits, planLimitMessage } from '@/lib/subscription';
import { usePlanCatalog } from '@/lib/plan-catalog';
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
  // Items over the Free plan limits stay editable here but are hidden from customers.
  const hiddenIds = new Set(state.planHiddenItemIds);
  usePlanCatalog();
  const planLimits = getPlanLimits(state.user?.subscription);
  const showPlanLimit = (kind: 'items' | 'categories') => {
    const { message, canUpgrade } = planLimitMessage(state.user?.subscription, kind);
    toast.error(message, canUpgrade ? {
      action: { label: 'Upgrade', onClick: () => dispatch({ type: 'SET_VIEW', payload: 'admin-subscription' }) },
    } : undefined);
  };
  const atItemLimit = foodItems.length >= planLimits.items;
  const currentCategories = categories.filter((c) => c.id !== 'all');
  const atCategoryLimit = currentCategories.length >= planLimits.categories;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [pricingType, setPricingType] = useState<'fixed' | 'variants'>('fixed');
  const [options, setOptions] = useState<FoodItemOption[]>([]);

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

  const soldOutUntil = useMemo(() => nextBusinessDayStart(state.shop.openingHours), [state.shop.openingHours]);

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenForm = (item?: FoodItem) => {
    if (!item && atItemLimit) {
      showPlanLimit('items');
      return;
    }
    setIsCreatingCategory(false);
    setNewCategoryName('');
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
      const pType = item.pricingType || (item.options && item.options.length > 0 ? 'variants' : 'fixed');
      setPricingType(pType);
      if (item.options && item.options.length > 0) {
        setOptions(item.options.map((o) => ({ ...o })));
      } else if (pType === 'variants' && !item.id.startsWith('item-')) {
        MenuService.getItemOptions(item.id).then((fetched) => {
          if (fetched && fetched.length > 0) {
            setOptions(
              fetched.map((o) => ({
                id: o.id,
                foodItemId: o.food_item_id,
                name: o.name,
                description: o.description || '',
                price: Number(o.price),
                isAvailable: o.is_available,
                displayOrder: o.display_order,
              }))
            );
          } else {
            setOptions([
              {
                id: `opt-${Date.now()}-1`,
                name: 'Regular',
                description: '',
                price: item.finalPrice || item.originalPrice || 0,
                isAvailable: true,
                displayOrder: 0,
              },
            ]);
          }
        });
      } else {
        setOptions([]);
      }
    } else {
      setEditingItem(null);
      setPricingType('fixed');
      setOptions([]);
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

  const handleTogglePricingType = (checked: boolean) => {
    if (!checked && options.length > 0 && options.some((o) => o.name.trim() || o.price > 0)) {
      const confirmDisable = window.confirm(
        'Switching to single-price mode will use the standard price. Your multiple options will be replaced when you save. Do you want to continue?'
      );
      if (!confirmDisable) return;
    }
    const nextType = checked ? 'variants' : 'fixed';
    setPricingType(nextType);
    if (nextType === 'variants' && options.length === 0) {
      const basePrice = formData.originalPrice || 0;
      setOptions([
        {
          id: `opt-${Date.now()}-1`,
          name: 'Regular',
          description: '',
          price: basePrice > 0 ? basePrice : 0,
          isAvailable: true,
          displayOrder: 0,
        },
        {
          id: `opt-${Date.now()}-2`,
          name: 'Large',
          description: '',
          price: basePrice > 0 ? Math.round(basePrice * 1.5) : 0,
          isAvailable: true,
          displayOrder: 1,
        },
      ]);
    }
  };

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: `opt-${Date.now()}-${prev.length + 1}`,
        name: '',
        description: '',
        price: 0,
        isAvailable: true,
        displayOrder: prev.length,
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOption = <K extends keyof FoodItemOption>(
    index: number,
    field: K,
    value: FoodItemOption[K]
  ) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Item name is required.');
      return;
    }

    const isVariants = pricingType === 'variants';

    if (isVariants) {
      if (options.length === 0) {
        toast.error('Please add at least one pricing option.');
        return;
      }
      for (let i = 0; i < options.length; i++) {
        if (!options[i].name?.trim()) {
          toast.error(`Option #${i + 1} must have a name.`);
          return;
        }
        if (options[i].price === undefined || options[i].price <= 0 || isNaN(options[i].price)) {
          toast.error(`Option "${options[i].name}" must have a valid positive price.`);
          return;
        }
      }
      const names = options.map((o) => o.name.trim().toLowerCase());
      if (new Set(names).size !== names.length) {
        toast.error('Option names must be unique for this product.');
        return;
      }
    } else {
      if (formData.originalPrice === undefined || formData.originalPrice <= 0 || isNaN(formData.originalPrice)) {
        toast.error('Please enter a valid original price.');
        return;
      }
    }

    if (!editingItem && atItemLimit) {
      showPlanLimit('items');
      return;
    }

    let originalPrice = formData.originalPrice || 0;
    let finalPrice = formData.discountedPrice ? formData.discountedPrice : originalPrice;
    let discount = 0;

    if (isVariants) {
      const availableOptions = options.filter((o) => o.isAvailable);
      const pool = availableOptions.length > 0 ? availableOptions : options;
      const minPrice = Math.min(...pool.map((o) => o.price));
      originalPrice = minPrice;
      finalPrice = minPrice;
      discount = 0;
    } else {
      discount = formData.discountedPrice
        ? Math.round(((formData.originalPrice! - formData.discountedPrice) / formData.originalPrice!) * 100)
        : 0;
    }

    let finalCategoryName = formData.category || '';
    if (isCreatingCategory && newCategoryName.trim()) {
      finalCategoryName = newCategoryName.trim();
    }

    const isNewCat = !!finalCategoryName && !currentCategories.some((c) => c.name.toLowerCase() === finalCategoryName.toLowerCase());
    if (isNewCat && atCategoryLimit) {
      showPlanLimit('categories');
      return;
    }
    
    let newItemId = editingItem?.id || `item-${Date.now()}`;

    // A "sold out today" item shows the Available switch off. Leaving it off keeps the
    // temporary hold; switching it on clears it; switching an available item off hides it.
    const keepsTodayHold = !!editingItem?.unavailableUntil && !formData.isAvailable;
    const availabilityPayload = keepsTodayHold
      ? { is_available: true }
      : { is_available: formData.isAvailable ?? true, unavailable_until: null };

    try {
      if (state.shop.id && state.shop.id !== 'shop-1') {
        type FoodItemInsert = Database['public']['Tables']['food_items']['Insert'];
        const dbPayload: FoodItemInsert = {
          shop_id: state.shop.id,
          name: formData.name.trim(),
          description: formData.description || null,
          tagline: formData.tagline || null,
          image: formData.image || null,
          original_price: originalPrice,
          discount: discount,
          final_price: Number(finalPrice.toFixed(2)),
          is_special_offer: formData.isSpecialOffer,
          ...availabilityPayload,
          category: finalCategoryName || null,
          pricing_type: pricingType,
        };

        if (editingItem && !editingItem.id.startsWith('item-')) {
          await MenuService.updateMenuItem(editingItem.id, dbPayload);
          newItemId = editingItem.id;
        } else {
          const data = await MenuService.addMenuItem(dbPayload);
          if (data) newItemId = data.id;
        }

        if (isVariants) {
          await MenuService.saveItemOptions(newItemId, state.shop.id, options);
        } else if (editingItem && !editingItem.id.startsWith('item-')) {
          await MenuService.saveItemOptions(newItemId, state.shop.id, []);
        }
      }

      const cleanOptions: FoodItemOption[] | undefined = isVariants
        ? options.map((opt, idx) => ({
            id: opt.id || `opt-${newItemId}-${idx}`,
            foodItemId: newItemId,
            name: opt.name.trim(),
            description: opt.description?.trim() || undefined,
            price: Number(opt.price),
            isAvailable: opt.isAvailable ?? true,
            displayOrder: idx,
          }))
        : undefined;

      const itemData: FoodItem = {
        id: newItemId,
        name: formData.name.trim(),
        description: formData.description || '',
        tagline: formData.tagline || '',
        category: finalCategoryName,
        image: formData.image || '/food-burger.jpg',
        originalPrice: originalPrice,
        discountedPrice: isVariants ? 0 : (formData.discountedPrice || 0),
        discount: discount,
        finalPrice: Number(finalPrice.toFixed(2)),
        isSpecialOffer: formData.isSpecialOffer || false,
        isAvailable: keepsTodayHold ? false : formData.isAvailable ?? true,
        ...(keepsTodayHold && editingItem?.unavailableUntil ? { unavailableUntil: editingItem.unavailableUntil } : {}),
        pricingType: pricingType,
        options: cleanOptions,
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
      // Plan limit messages come from the database (enforce_free_plan_menu_limits).
      const planMessage = (err as { code?: string; message?: string })?.code === 'P0001' ? (err as { message?: string }).message : '';
      toast.error(planMessage || 'Failed to save food item.');
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

  // "Sold out for today" hides the item until the shop's next opening time, when it
  // returns on its own. "Unavailable" hides it until the owner turns it back on.
  const handleSetAvailability = async (item: FoodItem, status: FoodAvailability) => {
    const until = status === 'today' ? nextBusinessDayStart(state.shop.openingHours).toISOString() : null;
    try {
      if (!item.id.startsWith('item-') && state.shop.id && state.shop.id !== 'shop-1') {
        await MenuService.updateMenuItem(item.id, { is_available: status !== 'off', unavailable_until: until });
      }
      const updated: FoodItem = { ...item, isAvailable: status === 'available' };
      if (until) updated.unavailableUntil = until; else delete updated.unavailableUntil;
      dispatch({ type: 'UPDATE_FOOD_ITEM', payload: updated });
      toast.success(
        status === 'available' ? `${item.name} is available again`
          : status === 'today' ? `${item.name} is sold out for today`
          : `${item.name} is hidden from your menu`,
        { description: status === 'today' && until ? `It comes back automatically ${formatReturnTime(until)}.` : undefined },
      );
    } catch (err) {
      console.error('Error updating availability:', err);
      toast.error('Failed to update availability.');
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      if (atCategoryLimit) {
                        showPlanLimit('categories');
                        return;
                      }
                      setIsCreatingCategory(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </div>
              )}
            </div>

            {/* Pricing Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <div className="pr-3">
                <p className="font-medium text-sm">Multiple options</p>
                <p className="text-xs text-muted-foreground">
                  Offer different sizes, portions, or pricing options for this product
                </p>
              </div>
              <Switch
                checked={pricingType === 'variants'}
                onCheckedChange={handleTogglePricingType}
              />
            </div>

            {/* Standard Single Pricing Mode */}
            {pricingType === 'fixed' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original Price (Rs.) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
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
                    min="0"
                    value={formData.discountedPrice || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00 (Optional)"
                  />
                </div>
              </div>
            ) : (
              /* Multiple Options Configuration Table */
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Portions & Options</Label>
                    <p className="text-xs text-muted-foreground">Configure options with individual pricing.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="text-xs h-8 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Option
                  </Button>
                </div>

                {options.length === 0 ? (
                  <div className="p-4 border border-dashed border-border rounded-xl text-center space-y-2 bg-muted/20">
                    <p className="text-xs text-muted-foreground">No options added yet.</p>
                    <Button type="button" size="sm" variant="secondary" onClick={handleAddOption} className="text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add First Option
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {options.map((option, index) => (
                      <div
                        key={option.id || index}
                        className={cn(
                          'p-3 rounded-xl border transition-all space-y-2.5',
                          option.isAvailable ? 'bg-card/70 border-border' : 'bg-card/30 border-border/40 opacity-75'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground/80">
                            Option {index + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-muted-foreground">{option.isAvailable ? 'Available' : 'Unavailable'}</span>
                              <Switch
                                checked={option.isAvailable}
                                onCheckedChange={(checked) => handleUpdateOption(index, 'isAvailable', checked)}
                                className="scale-75"
                              />
                            </div>
                            {options.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveOption(index)}
                                className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg"
                                title="Delete option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Option Name *</Label>
                            <Input
                              placeholder="e.g. S, Regular, 250ml"
                              value={option.name}
                              onChange={(e) => handleUpdateOption(index, 'name', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Serving / Quantity</Label>
                            <Input
                              placeholder="e.g. 1 Person, 250 ml"
                              value={option.description || ''}
                              onChange={(e) => handleUpdateOption(index, 'description', e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">Price (Rs.) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={option.price || ''}
                              onChange={(e) => handleUpdateOption(index, 'price', parseFloat(e.target.value) || 0)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                <p className="text-xs text-muted-foreground">
                  {editingItem?.unavailableUntil && !formData.isAvailable
                    ? `Sold out today · back ${formatReturnTime(editingItem.unavailableUntil)}`
                    : 'Show on menu'}
                </p>
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
              (!item.isAvailable || hiddenIds.has(item.id)) && 'opacity-60'
            )}
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className={cn('w-full h-full object-cover rounded-xl', hiddenIds.has(item.id) && 'grayscale')}
              />
              {hiddenIds.has(item.id) && (
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40" aria-hidden="true">
                  <Lock className="w-5 h-5 text-white" />
                </span>
              )}
              {item.isSpecialOffer && (
                <span className="absolute -top-1 -left-1 p-1 rounded-full bg-primary">
                  <Star className="w-2.5 h-2.5 text-primary-foreground" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{item.name}</h4>
              {hiddenIds.has(item.id) && (
                <p className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
                  <Lock className="w-3 h-3" /> Hidden on Free plan
                </p>
              )}
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.category}
              </p>
              <FoodAvailabilityBadge item={item} className="mt-1" />
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-sm font-bold">
                  {item.pricingType === 'variants' && item.options && item.options.length > 0
                    ? `From Rs. ${item.finalPrice.toFixed(2)}`
                    : `Rs. ${item.finalPrice.toFixed(2)}`}
                </span>
                {item.pricingType === 'variants' && item.options && item.options.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                    {item.options.length} options
                  </span>
                )}
                {(item.discountedPrice ?? 0) > 0 && item.pricingType !== 'variants' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded-full">
                    Offer
                  </span>
                )}
              </div>
            </div>
            <FoodItemActionsMenu
              item={item}
              soldOutUntil={soldOutUntil}
              onEdit={() => handleOpenForm(item)}
              onToggleSpecial={() => handleToggleQuick(item, 'isSpecialOffer')}
              onSetAvailability={(status) => void handleSetAvailability(item, status)}
              onDelete={() => void handleDelete(item.id)}
            />
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
