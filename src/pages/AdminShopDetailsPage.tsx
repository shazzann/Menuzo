import { useState } from 'react';
import { LogOut, Camera, Save, Plus, X, Clock, Edit3, MapPin } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'UPDATE_SHOP', payload: formData });
      setIsSaving(false);
      setIsEditing(false);
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
              <h1 className="font-semibold text-sm">Shop Details</h1>
              <p className="text-xs text-muted-foreground">Edit your shop info</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
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
              disabled={!isEditing}
              className={`absolute inset-0 flex items-center justify-center bg-background/50 transition-opacity ${isEditing ? 'opacity-0 hover:opacity-100' : 'opacity-0'}`}
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
                disabled={!isEditing}
                className={`absolute inset-0 flex items-center justify-center bg-background/50 transition-opacity ${isEditing ? 'opacity-0 hover:opacity-100' : 'opacity-0'}`}
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
              {!isEditing && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(formData.location)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted text-primary hover:bg-muted/80 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </a>
              )}
            </div>
            {formData.location && (
              <div className="mt-2 w-full h-48 rounded-xl overflow-hidden border border-border">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Phone Number</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
              placeholder="+1 (555) 000-0000"
              disabled={!isEditing}
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
              disabled={!isEditing}
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

        {/* Success Message */}
        {showSuccess && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm text-center">
            Changes saved successfully!
          </div>
        )}

        {/* Submit Button */}
        {isEditing && (
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
        )}
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
