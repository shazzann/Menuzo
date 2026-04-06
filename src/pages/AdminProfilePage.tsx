import { useState } from 'react';
import { LogOut, Camera, Save, CreditCard, Calendar, Check, Lock, Mail, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import type { AdminTab } from '@/types';
import { cn } from '@/lib/utils';

export function AdminProfilePage() {
  const { state, dispatch } = useApp();
  const { user, shop } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    shopName: shop.name,
    email: user?.email || '',
    notifications: true,
    darkMode: true,
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
      dispatch({ type: 'UPDATE_SHOP', payload: { name: formData.shopName } });
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

  const handleTabChange = (tab: AdminTab) => {
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
    switch (tab) {
      case 'menu-preview':
        dispatch({ type: 'SET_VIEW', payload: 'admin-preview' });
        break;
      case 'shop-details':
        dispatch({ type: 'SET_VIEW', payload: 'admin-shop-details' });
        break;
      case 'add-food':
        dispatch({ type: 'SET_VIEW', payload: 'admin-add-food' });
        break;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'text-primary';
      case 'enterprise':
        return 'text-purple-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-primary/20 text-primary';
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-muted text-muted-foreground';
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
              <h1 className="font-semibold text-sm">Profile</h1>
              <p className="text-xs text-muted-foreground">Account settings</p>
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

      {/* Profile Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-muted mx-auto">
              <img
                src={shop.logo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="font-bold text-lg mt-3">{shop.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Subscription Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 card-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Plan</p>
                <p className={cn('font-bold text-lg capitalize', getPlanColor(user?.subscription.plan || 'free'))}>
                  {user?.subscription.plan}
                </p>
              </div>
            </div>
            <span className={cn('px-3 py-1 text-xs font-mono uppercase rounded-full', getPlanBadge(user?.subscription.plan || 'free'))}>
              {user?.subscription.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span>Expires {user?.subscription.expiresAt.toLocaleDateString()}</span>
          </div>

          <Button
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
          >
            Upgrade Plan
          </Button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="font-semibold text-sm">Shop Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="shopName" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Shop Name
            </Label>
            <Input
              id="shopName"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <h3 className="font-semibold text-sm pt-2">Preferences</h3>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
            <div>
              <p className="font-medium text-sm">Notifications</p>
              <p className="text-xs text-muted-foreground">Receive order updates</p>
            </div>
            <Switch
              checked={formData.notifications}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
            <div>
              <p className="font-medium text-sm">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Always on for Menuzo</p>
            </div>
            <Switch checked={true} disabled />
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Changes saved successfully!
            </div>
          )}

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

        {/* Security */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Security</h3>
          
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
                <Input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">New Password</Label>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Update
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'LOGOUT' })}
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Menuzo v1.0.0
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="profile"
        onTabChange={handleTabChange}
        isAdmin={true}
      />
    </div>
  );
}
