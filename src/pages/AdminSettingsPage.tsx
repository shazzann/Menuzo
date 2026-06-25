import { useState } from 'react';
import { LogOut, Camera, Save, Lock, Mail, Store, ArrowLeft, Paintbrush, QrCode, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/store';
import { cn } from '@/lib/utils';

type SettingsTab = 'profile' | 'customization' | 'qr' | 'security';

export function AdminSettingsPage() {
  const { state, dispatch } = useApp();
  const { user, shop } = state;
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    shopName: shop.name,
    email: user?.email || '',
    instagram: shop.socialLinks?.instagram || '',
    facebook: shop.socialLinks?.facebook || '',
    website: shop.socialLinks?.website || '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      dispatch({ 
        type: 'UPDATE_SHOP', 
        payload: { 
          name: formData.shopName,
          socialLinks: {
            instagram: formData.instagram,
            facebook: formData.facebook,
            website: formData.website,
          }
        } 
      });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match');
      return;
    }
    setShowPasswordForm(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    alert('Password updated successfully');
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'customization' as const, label: 'Theme', icon: Paintbrush },
    { id: 'qr' as const, label: 'QR Code', icon: QrCode },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-analytics' })}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-sm">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your shop</p>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div className="flex overflow-x-auto scrollbar-hide px-4 pb-3 gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-muted mx-auto">
                  <img src={shop.logo} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button type="button" className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-sm">Shop Information</h3>
            <div className="space-y-2">
              <Label htmlFor="shopName" className="flex items-center gap-2">
                <Store className="w-4 h-4" /> Shop Name
              </Label>
              <Input id="shopName" value={formData.shopName} onChange={(e) => setFormData({ ...formData, shopName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <h3 className="font-semibold text-sm pt-2">Social Media</h3>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="@yourrestaurant" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} placeholder="yourrestaurant" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="yourrestaurant.com" />
            </div>

            {showSuccess && (
              <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm text-center">
                Changes saved successfully!
              </div>
            )}
            <Button type="submit" disabled={isSaving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </form>
        )}

        {activeTab === 'customization' && (
          <div className="text-center py-12">
            <Paintbrush className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-medium text-lg">Theme Customization</h3>
            <p className="text-sm text-muted-foreground mt-1">Coming soon. Customize your menu's colors and fonts.</p>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-medium text-lg">QR Generator</h3>
            <p className="text-sm text-muted-foreground mt-1">Coming soon. Generate and customize your table QR codes.</p>
          </div>
        )}

        {activeTab === 'security' && (
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
        )}
      </div>
    </div>
  );
}
