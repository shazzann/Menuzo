import { useState } from 'react';
import { LogOut, Camera, Save, Plus, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import type { AdminTab } from '@/types';

export function AdminShopDetailsPage() {
  const { state, dispatch } = useApp();
  const { shop } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: shop.name,
    tagline: shop.tagline,
    description: shop.description,
    location: shop.location,
    contactNumber: shop.contactNumber,
    email: shop.email,
    isOpen: shop.isOpen,
    openingHours: [...shop.openingHours],
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (index: number, field: string, value: string) => {
    const newHours = [...formData.openingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData((prev) => ({ ...prev, openingHours: newHours }));
  };

  const addHoursRow = () => {
    setFormData((prev) => ({
      ...prev,
      openingHours: [...prev.openingHours, { day: '', hours: '' }],
    }));
  };

  const removeHoursRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: prev.openingHours.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'UPDATE_SHOP', payload: formData });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleTabChange = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
    switch (tab) {
      case 'menu-preview':
        dispatch({ type: 'SET_VIEW', payload: 'admin-preview' });
        break;
      case 'add-food':
        dispatch({ type: 'SET_VIEW', payload: 'admin-add-food' });
        break;
      case 'profile':
        dispatch({ type: 'SET_VIEW', payload: 'admin-profile' });
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
              <h1 className="font-semibold text-sm">Shop Details</h1>
              <p className="text-xs text-muted-foreground">Edit your shop info</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative h-40 rounded-2xl overflow-hidden bg-muted">
            <img
              src={shop.banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background">
                <Camera className="w-4 h-4" />
                <span className="text-sm">Change Banner</span>
              </div>
            </button>
          </div>
          <div className="flex justify-center -mt-10">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-background bg-muted">
              <img
                src={shop.logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera className="w-5 h-5" />
              </button>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="A short catchy phrase"
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
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Contact Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Full address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Phone Number</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="hello@yourrestaurant.com"
            />
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
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {formData.openingHours.map((schedule, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={schedule.day}
                  onChange={(e) => handleHoursChange(index, 'day', e.target.value)}
                  placeholder="Mon - Fri"
                  className="flex-1"
                />
                <Input
                  value={schedule.hours}
                  onChange={(e) => handleHoursChange(index, 'hours', e.target.value)}
                  placeholder="9:00 AM - 10:00 PM"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHoursRow(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm text-center">
            Changes saved successfully!
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </form>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="shop-details"
        onTabChange={handleTabChange}
        isAdmin={true}
      />
    </div>
  );
}
