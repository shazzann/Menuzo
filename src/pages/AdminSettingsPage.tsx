import { useState } from 'react';
import {  LogOut, Camera, Save, Lock, Store, ArrowLeft, Paintbrush, QrCode, Shield, Edit3, X, MapPin, Clock, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useApp } from '@/store';
import { cn } from '@/lib/utils';

import type { Database } from '@/types/supabase';

import { uploadImageToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary';
import { ImageCropperModal } from '@/components/shared/ImageCropperModal';
import { ThemedMap } from '@/components/shared/ThemedMap';
import { AdminThemeSettings } from '@/components/admin/AdminThemeSettings';
import { AdminQrSettings } from '@/components/admin/AdminQrSettings';
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

type SettingsTab = 'shop' | 'customization' | 'qr' | 'security';

export function AdminSettingsPage() {
  const { state, dispatch } = useApp();
  const { user, shop } = state;
  const [activeTab, setActiveTab] = useState<SettingsTab>('shop');
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
    openingHours: [...shop.openingHours],
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

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
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
      const { url } = await uploadImageToCloudinary(croppedFile);
      
      const oldUrl = formData[cropType];
      if (oldUrl) {
        deleteImageFromCloudinary(oldUrl);
      }

      setFormData(prev => ({ ...prev, [cropType]: url }));
      toast.success(`${cropType === 'logo' ? 'Logo' : 'Banner'} uploaded successfully`, { id: `upload-${cropType}` });
    } catch (err: any) {
      toast.error(err.message || `Failed to upload ${cropType}`, { id: `upload-${cropType}` });
    }
  };

  const handleRemoveImage = (type: 'logo' | 'banner') => {
    if (!window.confirm(`Are you sure you want to remove the ${type}?`)) return;
    const oldUrl = formData[type];
    if (oldUrl) {
      deleteImageFromCloudinary(oldUrl);
    }
    setFormData(prev => ({ ...prev, [type]: '' }));
    toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} removed.`);
  };


  const handleHoursChange = (index: number, field: string, value: string | boolean) => {
    const newHours = [...formData.openingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData((prev) => ({ ...prev, openingHours: newHours }));
  };

  const addHoursRow = () => {
    setFormData((prev) => ({
      ...prev,
      openingHours: [...prev.openingHours, { day: '', hours: '', isSpecialDay: false, date: '' }],
    }));
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
      const { supabase } = await import('@/lib/supabase');
      type ShopUpdate = Database['public']['Tables']['shops']['Update'];
      
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
      };

      let finalShopId = shop.id;

      if (!finalShopId || finalShopId === 'shop-1') {
        if (user?.id && user.id !== 'google-auth-bypass-id' && user.id !== 'user-1') {
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
        const { error } = await supabase
          .from('shops')
          .update(updatePayload)
          .eq('id', finalShopId);
        
        if (error) throw error;
      }

      dispatch({ 
        type: 'UPDATE_SHOP', 
        payload: { 
          ...formData,
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setShowPasswordForm(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    toast.success('Password updated successfully');
  };


  const tabs = [
    { id: 'shop' as const, label: 'Shop Info', icon: Store },
    { id: 'customization' as const, label: 'Theme', icon: Paintbrush },
    { id: 'qr' as const, label: 'QR Code', icon: QrCode },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

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
                const previousView = state.currentAdminTab === 'menu-preview' ? 'admin-preview' :
                                     state.currentAdminTab === 'add-food' ? 'admin-add-food' :
                                     state.currentAdminTab === 'analytics' ? 'admin-analytics' :
                                     'user-dashboard';

                if (isEditing) {
                  setPendingNav(() => () => dispatch({ type: 'SET_VIEW', payload: previousView }));
                } else {
                  dispatch({ type: 'SET_VIEW', payload: previousView });
                }
              }}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center">
              <img src="/logo/Logo favicon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
          </div>
          {(activeTab === 'shop' || activeTab === 'customization') && (
            isEditing ? (
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
            )
          )}
        </div>
        
        {/* Tab Bar */}
        <div className="flex justify-between items-center px-8 pb-4 max-w-md mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab === tab.id) return;
                  if (isEditing) {
                    setPendingNav(() => () => setActiveTab(tab.id));
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                title={tab.label}
                className={cn(
                  "flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full transition-colors",
                  activeTab === tab.id 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <form id="settings-form" onSubmit={handleSave} className="px-4 py-4 space-y-6">
        {activeTab === 'shop' && (
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Opening Hours
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHoursRow}
                  className="gap-1"
                  disabled={!isEditing}
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {formData.openingHours.map((schedule, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-xl bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.isSpecialDay}
                          onCheckedChange={(checked) => handleHoursChange(index, 'isSpecialDay', checked)}
                          disabled={!isEditing}
                        />
                        <Label className="text-xs">Special Day/Date</Label>
                      </div>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHoursRow(index)}
                          className="text-muted-foreground hover:text-destructive h-6 w-6"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.isSpecialDay ? (
                        <Input
                          type="date"
                          value={schedule.date || ''}
                          onChange={(e) => handleHoursChange(index, 'date', e.target.value)}
                          disabled={!isEditing}
                          className="flex-1"
                        />
                      ) : (
                        <Input
                          value={schedule.day}
                          onChange={(e) => handleHoursChange(index, 'day', e.target.value)}
                          placeholder="Mon - Fri"
                          disabled={!isEditing}
                          className="flex-1"
                        />
                      )}
                      <Input
                        value={schedule.hours}
                        onChange={(e) => handleHoursChange(index, 'hours', e.target.value)}
                        placeholder="9:00 AM - 10:00 PM"
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'customization' && (
          <div className="relative pb-20">
            <AdminThemeSettings
              theme={formData.theme as any}
              onChange={(theme) => setFormData(prev => ({ ...prev, theme }))}
              isEditing={isEditing}
              shopName={formData.name || shop.name}
            />
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="relative pb-20">
            <AdminQrSettings 
              shopUrl={`${window.location.origin}/${usernameInput || shop.username}/menu`}
              themePrimary={formData.theme?.primary || '#090A0C'}
              themeAccent={formData.theme?.accent || '#FB8500'}
              shopLogo={formData.logo}
              shopName={formData.name || shop.name}
              isSaving={isSaving}
              qrStyle={(formData.theme as any)?.qrStyle || 'classic'}
              qrPattern={(formData.theme as any)?.qrPattern || 'square'}
              onChangeStyle={(style) => setFormData(prev => ({
                ...prev,
                theme: { ...(prev.theme as any), qrStyle: style }
              }))}
              onChangePattern={(pattern) => setFormData(prev => ({
                ...prev,
                theme: { ...(prev.theme as any), qrPattern: pattern }
              }))}
            />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Account Information</h3>
              <div className="space-y-2">
                <Label className="text-xs">Shop URL Username</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="text" 
                    value={shop.username || 'your-shop-name'} 
                    disabled
                    className="flex-1 bg-muted text-muted-foreground opacity-100"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your menu is available at: {window.location.origin}/{shop.username || 'username'}/menu
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Account Email</Label>
                <Input 
                  type="email" 
                  value={user?.email || 'No email available'} 
                  disabled 
                  className="bg-muted text-muted-foreground opacity-100"
                />
                <p className="text-xs text-muted-foreground">
                  This is the email address used to log into Menuzo. It cannot be changed.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Password & Security</h3>
              {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Change Password</p>
                    <p className="text-xs text-muted-foreground">Update your password</p>
                  </div>
                </div>
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="p-4 rounded-xl bg-muted space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Current Password</Label>
                  <Input type="password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">New Password</Label>
                  <Input type="password" value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Confirm New Password</Label>
                  <Input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Update</Button>
                </div>
              </form>
            )}

            <div className="pt-8">
              <Button variant="outline" onClick={() => dispatch({ type: 'LOGOUT' })} className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </Button>
            </div>
            </div>
          </div>
        )}
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
