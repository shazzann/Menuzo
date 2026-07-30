import { useState } from 'react';
import { Camera, Save, Store, ArrowLeft, Edit3, X, MapPin, Clock, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useApp } from '@/store';

import type { Database } from '@/types/supabase';
import { StorageService, RestaurantService } from '@/services';
import { filterExpiredSpecialDates, getTodayDateString } from '@/lib/timeUtils';
import { ImageCropperModal } from '@/components/shared/ImageCropperModal';
import { ThemedMap } from '@/components/shared/ThemedMap';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AdminShopDetailsPage() {
  const { state, dispatch } = useApp();
  const { user, shop } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingNav, setPendingNav] = useState<(() => void) | null>(null);

  const [formData, setFormData] = useState({
    name: shop.name,
    tagline: shop.tagline || '',
    description: shop.description || '',
    location: shop.location || '',
    contactNumber: shop.contactNumber || '',
    contacts: shop.contacts || [],
    email: shop.email || user?.email || '',
    isOpen: shop.isOpen,
    openingHours: filterExpiredSpecialDates(shop.openingHours),
    instagram: shop.socialLinks?.instagram || '',
    facebook: shop.socialLinks?.facebook || '',
    website: shop.socialLinks?.website || '',
    logo: shop.logo || '',
    banner: shop.banner || '',
    theme: shop.theme || {
      primary: '#090A0C',
      secondary: '#1C1E22',
      accent: '#FB8500',
    },
  });



  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [cropType, setCropType] = useState<'logo' | 'banner'>('logo');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropImageSrc(url);
      setCropType(type);
      setCropModalOpen(true);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    toast.loading(`Uploading ${cropType}...`, { id: `upload-${cropType}` });
    try {
      const { url } = await StorageService.uploadImage(croppedFile);
      
      const oldUrl = formData[cropType];
      if (oldUrl && !oldUrl.startsWith('/')) {
        const path = oldUrl.split('restaurant-assets/')[1];
        if (path) await StorageService.deleteImage(path);
      }

      setFormData(prev => ({ ...prev, [cropType]: url }));
      toast.success(`${cropType === 'logo' ? 'Logo' : 'Banner'} uploaded successfully`, { id: `upload-${cropType}` });
    } catch (err: any) {
      toast.error(err.message || `Failed to upload ${cropType}`, { id: `upload-${cropType}` });
    }
  };

  const handleRemoveImage = async (type: 'logo' | 'banner') => {
    if (!window.confirm(`Are you sure you want to remove the ${type}?`)) return;
    const oldUrl = formData[type];
    if (oldUrl && !oldUrl.startsWith('/')) {
      const path = oldUrl.split('restaurant-assets/')[1];
      if (path) await StorageService.deleteImage(path);
    }
    setFormData(prev => ({ ...prev, [type]: '' }));
    toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} removed.`);
  };


  const addRegularHours = () => {
    setFormData((prev) => ({
      ...prev,
      openingHours: [...prev.openingHours, { type: 'regular', dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '22:00' }],
    }));
  };

  const addSpecialHours = () => {
    setFormData((prev) => ({
      ...prev,
      openingHours: [
        ...prev.openingHours,
        {
          type: 'special',
          date: getTodayDateString(),
          reason: '',
          isOpen: false,
          openTime: '09:00',
          closeTime: '22:00',
        },
      ],
    }));
  };

  const handleHoursChange = (index: number, field: string, value: any) => {
    const newHours = [...formData.openingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData((prev) => ({ ...prev, openingHours: newHours }));
  };

  const removeHoursRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: prev.openingHours.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    
    try {
      type ShopUpdate = Database['public']['Tables']['shops']['Update'];
      
      const cleanedHours = filterExpiredSpecialDates(formData.openingHours);
      const updatePayload: ShopUpdate = {
        name: formData.name,
        tagline: formData.tagline || null,
        description: formData.description || null,
        location: formData.location || null,
        contact_number: formData.contactNumber || null,
        contacts: formData.contacts as any, // Cast to any to bypass strict JSON type for now
        email: formData.email || null,
        is_open: formData.isOpen,
        instagram: formData.instagram || null,
        facebook: formData.facebook || null,
        website: formData.website || null,
        logo: formData.logo || null,
        banner: formData.banner || null,
        theme: formData.theme as any,
        opening_hours: cleanedHours as any,
      };

      let finalShopId = shop.id;

      if (!finalShopId || finalShopId === 'shop-1') {
        if (user?.id && user.id !== 'google-auth-bypass-id' && user.id !== 'user-1') {
          // this shouldn't happen with our new architecture since AdminDataLoader ensures shop exists, but keeping fallback
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase
            .from('shops')
            .insert({
              ...updatePayload,
              user_id: user.id,
            } as any)
            .select()
            .single();
          
          if (error) throw error;
          if (data) finalShopId = data.id;
        }
      } else {
        await RestaurantService.updateRestaurant(finalShopId, updatePayload);
      }

      setFormData(prev => ({ ...prev, openingHours: cleanedHours }));
      dispatch({ 
        type: 'UPDATE_SHOP', 
        payload: { 
          ...formData,
          openingHours: cleanedHours,
          socialLinks: {
            instagram: formData.instagram,
            facebook: formData.facebook,
            website: formData.website,
          }
        } 
      });
      setIsEditing(false);
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      if (err.message?.includes('shops_user_id_fkey')) {
         toast.error('Your current test account is missing a database profile. Please sign out and create a brand new account with a different email address to fix this.', { duration: 6000 });
      } else {
         toast.error(err.message || 'Failed to save settings.');
      }
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isEditing) {
                  setPendingNav(() => () => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' }));
                } else {
                  dispatch({ type: 'SET_VIEW', payload: 'admin-settings' });
                }
              }}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg ml-2">Shop Details</h1>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="px-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="settings-form"
                size="sm"
                disabled={isSaving}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <form id="settings-form" onSubmit={handleSave} className="px-4 py-4 space-y-6">
          <div className="space-y-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative h-40 rounded-2xl overflow-hidden bg-muted">
                {formData.banner ? (
                  <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">No Banner Uploaded</span>
                  </div>
                )}
                {isEditing && formData.banner && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                    onClick={() => handleRemoveImage('banner')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <label
                  className={`absolute inset-0 flex items-center justify-center bg-background/50 transition-opacity ${isEditing ? 'opacity-0 hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Change Banner</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" disabled={!isEditing} onChange={(e) => handleImageSelect(e, 'banner')} />
                </label>
              </div>
              <div className="flex justify-center -mt-10">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-background bg-muted flex items-center justify-center">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-8 h-8 text-muted-foreground/50" />
                  )}
                  {isEditing && formData.logo && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full z-10"
                      onClick={() => handleRemoveImage('logo')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  <label
                    className={`absolute inset-0 flex items-center justify-center bg-background/50 transition-opacity ${isEditing ? 'opacity-0 hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                  >
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" className="hidden" disabled={!isEditing} onChange={(e) => handleImageSelect(e, 'logo')} />
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopUsername">Shop URL / Username</Label>
                <div className="flex items-center">
                  <span className="text-muted-foreground bg-muted px-3 h-10 flex items-center justify-center rounded-l-md border border-r-0 border-input text-sm">menuzo.com/</span>
                  <Input
                    id="shopUsername"
                    value={shop.username || ''}
                    readOnly
                    className="rounded-l-none bg-muted/50 cursor-not-allowed text-muted-foreground focus-visible:ring-0"
                    onClick={() => {
                      if (isEditing) toast('Custom URLs are provided via Company Admin. Please contact support to upgrade.', { icon: '🔒' });
                    }}
                  />
                </div>
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Custom URLs are only available for Premium plans and are configured by admin.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Shop Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your restaurant name"
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="A short catchy phrase"
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Tell customers about your restaurant"
                  rows={3}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Contact Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Full address"
                    disabled={!isEditing}
                    className="flex-1"
                  />
                  {!isEditing && formData.location && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(formData.location)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted text-primary hover:bg-muted/80 flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </a>
                  )}
                </div>
                {formData.location && (
                  <div className="mt-2">
                    <ThemedMap location={formData.location} className="w-full h-48" />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Phone Numbers (Up to 3)</Label>
                  {isEditing && formData.contacts.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        contacts: [...prev.contacts, { id: Date.now().toString(), label: 'Main', number: '', isVisible: true }]
                      }))}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Number
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {formData.contacts.map((contact, index) => (
                    <div key={contact.id} className="flex gap-2 items-start bg-muted/30 p-3 rounded-lg border border-border">
                      <div className="space-y-3 flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Label</Label>
                            <Input
                              value={contact.label}
                              onChange={(e) => {
                                const newContacts = [...formData.contacts];
                                newContacts[index].label = e.target.value;
                                setFormData(prev => ({ ...prev, contacts: newContacts }));
                              }}
                              placeholder="e.g. Main, Delivery"
                              disabled={!isEditing}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Number</Label>
                            <Input
                              value={contact.number}
                              onChange={(e) => {
                                const newContacts = [...formData.contacts];
                                newContacts[index].number = e.target.value;
                                setFormData(prev => ({ ...prev, contacts: newContacts }));
                              }}
                              placeholder="+94 77 ..."
                              disabled={!isEditing}
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={contact.isVisible}
                            onCheckedChange={(checked) => {
                              const newContacts = [...formData.contacts];
                              newContacts[index].isVisible = checked;
                              setFormData(prev => ({ ...prev, contacts: newContacts }));
                            }}
                            disabled={!isEditing}
                          />
                          <Label className="text-xs font-normal cursor-pointer text-muted-foreground">Visible to customers</Label>
                        </div>
                      </div>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-9 w-9 mt-6"
                          onClick={() => {
                            const newContacts = formData.contacts.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, contacts: newContacts }));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.contacts.length === 0 && (
                    <div className="text-sm text-muted-foreground py-2.5 px-3 bg-muted/30 rounded-lg border border-border border-dashed text-center">
                      No phone numbers added.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Shop Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="hello@yourrestaurant.com"
                  disabled={!isEditing}
                />
                <p className="text-xs text-muted-foreground">
                  This email is public and used by customers to contact your shop.
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Social Media</h3>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={formData.instagram} onChange={(e) => handleChange('instagram', e.target.value)} placeholder="@yourrestaurant" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" value={formData.facebook} onChange={(e) => handleChange('facebook', e.target.value)} placeholder="yourrestaurant" disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="yourrestaurant.com" disabled={!isEditing} />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
              <div>
                <p className="font-medium text-sm">Shop Status</p>
                <p className="text-xs text-muted-foreground">
                  {formData.isOpen ? 'Currently open for business' : 'Currently closed'}
                </p>
              </div>
              <Switch
                checked={formData.isOpen}
                onCheckedChange={(checked) => handleChange('isOpen', checked)}
                disabled={!isEditing}
              />
            </div>

            {/* Opening Hours */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 px-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Regular Hours
                </h3>
                <div className="bg-card rounded-2xl border overflow-hidden shadow-sm divide-y divide-border/40">
                  {formData.openingHours.map((schedule, i) => ({ ...schedule, originalIndex: i })).filter(h => h.type === 'regular').map((schedule) => (
                    <div key={schedule.originalIndex} className="flex items-center justify-between p-3 relative hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center">
                        <select
                          className="h-8 w-[100px] bg-transparent text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer appearance-none px-1"
                          value={schedule.dayOfWeek}
                          onChange={(e) => handleHoursChange(schedule.originalIndex, 'dayOfWeek', parseInt(e.target.value))}
                          disabled={!isEditing}
                        >
                          <option value={0}>Sunday</option>
                          <option value={1}>Monday</option>
                          <option value={2}>Tuesday</option>
                          <option value={3}>Wednesday</option>
                          <option value={4}>Thursday</option>
                          <option value={5}>Friday</option>
                          <option value={6}>Saturday</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        {schedule.isOpen ? (
                          <div className="flex items-center gap-1 bg-muted/40 rounded-full px-2 py-1 border border-border/50">
                            <Input
                              type="time"
                              value={schedule.openTime || ''}
                              onChange={(e) => handleHoursChange(schedule.originalIndex, 'openTime', e.target.value)}
                              disabled={!isEditing}
                              className="h-6 w-[65px] px-1 py-0 text-[11px] text-center font-mono bg-transparent border-0 focus-visible:ring-0 shadow-none p-0"
                            />
                            <span className="text-muted-foreground/40 text-[10px]">-</span>
                            <Input
                              type="time"
                              value={schedule.closeTime || ''}
                              onChange={(e) => handleHoursChange(schedule.originalIndex, 'closeTime', e.target.value)}
                              disabled={!isEditing}
                              className="h-6 w-[65px] px-1 py-0 text-[11px] text-center font-mono bg-transparent border-0 focus-visible:ring-0 shadow-none p-0"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground uppercase font-semibold px-3 py-1.5">Closed</span>
                        )}

                        <Switch
                          checked={schedule.isOpen}
                          onCheckedChange={(checked) => handleHoursChange(schedule.originalIndex, 'isOpen', checked)}
                          disabled={!isEditing}
                          className="scale-[0.65] origin-right ml-1"
                        />

                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHoursRow(schedule.originalIndex)}
                            className="h-7 w-7 text-muted-foreground/40 hover:text-destructive shrink-0 -mr-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={addRegularHours}
                      className="w-full flex items-center justify-center gap-2 py-3.5 text-sm text-primary font-medium hover:bg-muted/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Regular Hours
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3 px-1 mt-6">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Special Hours
                </h3>
                <div className="bg-card rounded-2xl border overflow-hidden shadow-sm divide-y divide-border/40">
                  {formData.openingHours.map((schedule, i) => ({ ...schedule, originalIndex: i })).filter(h => h.type === 'special').map((schedule) => (
                    <div key={schedule.originalIndex} className="flex flex-col gap-2 p-3 relative hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <Input
                          type="date"
                          min={getTodayDateString()}
                          value={schedule.date || ''}
                          onChange={(e) => handleHoursChange(schedule.originalIndex, 'date', e.target.value)}
                          disabled={!isEditing}
                          className="h-8 w-[130px] px-2 text-sm font-medium bg-transparent border-0 focus-visible:ring-0 shadow-none p-0"
                        />
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={schedule.isOpen}
                            onCheckedChange={(checked) => handleHoursChange(schedule.originalIndex, 'isOpen', checked)}
                            disabled={!isEditing}
                            className="scale-[0.65] origin-right"
                          />
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeHoursRow(schedule.originalIndex)}
                              className="h-7 w-7 text-muted-foreground/40 hover:text-destructive shrink-0 -mr-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <Input
                        type="text"
                        placeholder="Reason (e.g. Poya Day)"
                        value={schedule.reason || ''}
                        onChange={(e) => handleHoursChange(schedule.originalIndex, 'reason', e.target.value)}
                        disabled={!isEditing}
                        className="h-8 text-[13px] bg-muted/40 border-0 rounded-lg px-3 placeholder:text-muted-foreground/50"
                      />

                      {schedule.isOpen && (
                        <div className="flex items-center gap-1.5 mt-1 bg-muted/40 rounded-full px-2 py-1 w-fit border border-border/50">
                          <Input
                            type="time"
                            value={schedule.openTime || ''}
                            onChange={(e) => handleHoursChange(schedule.originalIndex, 'openTime', e.target.value)}
                            disabled={!isEditing}
                            className="h-6 w-[70px] px-1 py-0 text-[11px] text-center font-mono bg-transparent border-0 focus-visible:ring-0 shadow-none p-0"
                          />
                          <span className="text-muted-foreground/40 text-[10px] font-semibold">-</span>
                          <Input
                            type="time"
                            value={schedule.closeTime || ''}
                            onChange={(e) => handleHoursChange(schedule.originalIndex, 'closeTime', e.target.value)}
                            disabled={!isEditing}
                            className="h-6 w-[70px] px-1 py-0 text-[11px] text-center font-mono bg-transparent border-0 focus-visible:ring-0 shadow-none p-0"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={addSpecialHours}
                      className="w-full flex items-center justify-center gap-2 py-3.5 text-sm text-primary font-medium hover:bg-muted/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Special Date
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
      </form>

      <AlertDialog open={!!pendingNav} onOpenChange={(open) => !open && setPendingNav(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave without saving? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingNav) pendingNav();
              setIsEditing(false);
            }}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageCropperModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={cropType === 'banner' ? 21 / 9 : 1}
        title={`Crop ${cropType === 'banner' ? 'Banner' : 'Logo'}`}
      />
    </div>
  );
}
