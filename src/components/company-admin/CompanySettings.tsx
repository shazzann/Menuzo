import { useState } from 'react';
import {
  Settings, Shield, CreditCard, Zap, Mail, Bell, Save, Upload,
  Globe, Phone, MapPin, Clock, Building2, Palette, Moon, Sun,
  Smartphone, Monitor, Key, Lock, Eye, EyeOff,
} from 'lucide-react';

type SettingsTab = 'general' | 'security' | 'billing' | 'integrations' | 'email' | 'notifications' | 'appearance';

export function CompanySettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs = [
    { id: 'general' as const, label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'security' as const, label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'billing' as const, label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'integrations' as const, label: 'Integrations', icon: <Zap className="w-4 h-4" /> },
    { id: 'email' as const, label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance' as const, label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your admin panel preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-2 space-y-0.5 sticky top-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === 'general' && (
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Company Settings</h3>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  M
                </div>
                <div>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 text-sm transition-colors">
                    <Upload className="w-4 h-4" /> Change Logo
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 512x512 PNG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', value: 'Menuzo', icon: <Building2 className="w-4 h-4" /> },
                  { label: 'Support Email', value: 'support@menuzo.com', icon: <Mail className="w-4 h-4" /> },
                  { label: 'Phone', value: '+94 11 234 5678', icon: <Phone className="w-4 h-4" /> },
                  { label: 'Website', value: 'https://menuzo.com', icon: <Globe className="w-4 h-4" /> },
                  { label: 'Address', value: 'Colombo 03, Sri Lanka', icon: <MapPin className="w-4 h-4" /> },
                  { label: 'Timezone', value: 'Asia/Colombo (UTC+5:30)', icon: <Clock className="w-4 h-4" /> },
                ].map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      {field.icon} {field.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Currency</label>
                  <select className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>USD ($)</option>
                    <option>LKR (Rs)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Language</label>
                  <select className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>English</option>
                    <option>Sinhala</option>
                    <option>Tamil</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Authentication</h3>
                {[
                  { label: 'Password Policy', desc: 'Minimum 8 characters, uppercase, numbers', enabled: true },
                  { label: 'Two-Factor Auth', desc: 'Require 2FA for all admin accounts', enabled: true },
                  { label: 'Session Timeout', desc: 'Auto logout after 30 minutes of inactivity', enabled: false },
                  { label: 'IP Whitelist', desc: 'Restrict access to specific IP addresses', enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button className={`relative w-11 h-6 rounded-full transition-colors ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">API Keys</h3>
                {[
                  { name: 'Production API Key', key: 'mk_live_••••••••••••4a2b', created: '2026-01-15' },
                  { name: 'Test API Key', key: 'mk_test_••••••••••••8c3d', created: '2026-03-20' },
                ].map((apiKey) => (
                  <div key={apiKey.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{apiKey.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{apiKey.key}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors font-medium">
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Billing Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-emerald-500">$48,200</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold text-amber-500">$3,420</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 text-center">
                  <p className="text-xs text-muted-foreground">Failed Payments</p>
                  <p className="text-2xl font-bold text-red-500">$890</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Payment Gateway</h4>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Stripe</p>
                      <p className="text-xs text-emerald-500">Connected</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 text-xs font-medium transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Integrations</h3>
              {[
                { name: 'Google Maps', desc: 'Location services for shops', status: 'Connected', color: 'text-emerald-500' },
                { name: 'Cloudinary', desc: 'Media storage and optimization', status: 'Connected', color: 'text-emerald-500' },
                { name: 'Firebase', desc: 'Push notifications', status: 'Connected', color: 'text-emerald-500' },
                { name: 'WhatsApp Business', desc: 'Customer messaging', status: 'Not Connected', color: 'text-slate-500' },
                { name: 'Slack', desc: 'Team notifications', status: 'Not Connected', color: 'text-slate-500' },
                { name: 'Analytics', desc: 'Advanced usage tracking', status: 'Connected', color: 'text-emerald-500' },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${integration.color}`}>{integration.status}</span>
                    <button className="px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 text-xs font-medium transition-colors">
                      {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Email Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'SMTP Host', value: 'smtp.menuzo.com' },
                  { label: 'SMTP Port', value: '587' },
                  { label: 'Sender Name', value: 'Menuzo Team' },
                  { label: 'Sender Email', value: 'noreply@menuzo.com' },
                ].map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email Signature</label>
                <textarea
                  rows={3}
                  defaultValue="Best regards,&#10;The Menuzo Team"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors">
                  <Mail className="w-4 h-4" /> Send Test Email
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              {[
                { label: 'Email Notifications', desc: 'Receive emails for important events', enabled: true },
                { label: 'SMS Notifications', desc: 'SMS alerts for critical events', enabled: false },
                { label: 'Push Notifications', desc: 'Browser push notifications', enabled: true },
                { label: 'Desktop Notifications', desc: 'Desktop app notifications', enabled: true },
                { label: 'In-app Notifications', desc: 'Show notifications in admin panel', enabled: true },
                { label: 'Slack Integration', desc: 'Forward alerts to Slack channel', enabled: false },
                { label: 'Webhook Alerts', desc: 'Send events to webhook URL', enabled: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <button className={`relative w-11 h-6 rounded-full transition-colors ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-semibold">Appearance Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="flex gap-3">
                    {[
                      { label: 'Light', icon: <Sun className="w-5 h-5" /> },
                      { label: 'Dark', icon: <Moon className="w-5 h-5" /> },
                      { label: 'System', icon: <Monitor className="w-5 h-5" /> },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          theme.label === 'Dark' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'
                        }`}
                      >
                        {theme.icon}
                        <span className="text-xs font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Accent Color</label>
                  <div className="flex gap-2">
                    {['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#06b6d4'].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${color === '#f97316' ? 'ring-2 ring-offset-2 ring-offset-card ring-primary' : ''}`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sidebar Style</label>
                  <select className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Default</option>
                    <option>Compact</option>
                    <option>Minimal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Density</label>
                  <select className="w-full px-3 py-2.5 rounded-xl bg-muted/20 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Comfortable</option>
                    <option>Compact</option>
                    <option>Spacious</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
