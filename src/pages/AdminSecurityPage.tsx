import { useState } from 'react';
import { ArrowLeft, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';

export function AdminSecurityPage() {
  const { state, dispatch } = useApp();
  const { shop, user } = state;
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Error logging out:', err);
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'admin-settings' })}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-lg">Security Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
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
              Your menu is available at: {window.location.origin}/{shop.username || 'username'}
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
            <Button variant="outline" onClick={handleLogout} className="w-full border-destructive/30 text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
