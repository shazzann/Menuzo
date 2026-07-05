import { useState } from 'react';
import { useApp } from '@/store';
import type { CompanyAdminSection } from '@/types';
import {
  LayoutDashboard, Store, ShieldCheck, FileText, CreditCard, Tag, Megaphone,
  Palette, BarChart3, Headphones, MessageSquare, Settings, Activity, Server,
  ChevronDown, ChevronRight, Bell, Search, Moon, Sun, Menu, X, LogOut,
  User, Zap, Globe, BookOpen, HelpCircle, Mail, Ticket, TrendingUp,
  PieChart, Users, Clock,
} from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeProvider';
import { CompanyDashboard } from '@/components/company-admin/CompanyDashboard';
import { CompanyShopList } from '@/components/company-admin/CompanyShopList';
import { CompanyShopDetail } from '@/components/company-admin/CompanyShopDetail';
import { CompanyPlans } from '@/components/company-admin/CompanyPlans';
import { CompanyReports } from '@/components/company-admin/CompanyReports';
import { CompanySupport } from '@/components/company-admin/CompanySupport';
import { CompanySettings } from '@/components/company-admin/CompanySettings';
import { CompanyAuditLogs } from '@/components/company-admin/CompanyAuditLogs';
import { CompanySystemHealth } from '@/components/company-admin/CompanySystemHealth';

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: { label: string; section: CompanyAdminSection; icon: React.ReactNode }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Business',
    icon: <Store className="w-4 h-4" />,
    items: [
      { label: 'Shops', section: 'shops', icon: <Store className="w-4 h-4" /> },
      { label: 'Verification', section: 'shop-verification', icon: <ShieldCheck className="w-4 h-4" /> },
      { label: 'Requests', section: 'shop-requests', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Plans',
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      { label: 'Subscription Plans', section: 'subscription-plans', icon: <CreditCard className="w-4 h-4" /> },
      { label: 'Coupons', section: 'coupons', icon: <Tag className="w-4 h-4" /> },
      { label: 'Promotions', section: 'promotions', icon: <Megaphone className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Themes',
    icon: <Palette className="w-4 h-4" />,
    items: [
      { label: 'Theme Library', section: 'theme-library', icon: <Palette className="w-4 h-4" /> },
      { label: 'Marketplace', section: 'theme-marketplace', icon: <Globe className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Marketing',
    icon: <Megaphone className="w-4 h-4" />,
    items: [
      { label: 'Campaigns', section: 'campaigns', icon: <Zap className="w-4 h-4" /> },
      { label: 'Notifications', section: 'notifications', icon: <Bell className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Reports',
    icon: <BarChart3 className="w-4 h-4" />,
    items: [
      { label: 'Revenue', section: 'revenue-reports', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Shops', section: 'shop-reports', icon: <PieChart className="w-4 h-4" /> },
      { label: 'Usage Analytics', section: 'usage-analytics', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Growth', section: 'growth', icon: <TrendingUp className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Support',
    icon: <Headphones className="w-4 h-4" />,
    items: [
      { label: 'Tickets', section: 'tickets', icon: <Ticket className="w-4 h-4" /> },
      { label: 'Live Chat', section: 'live-chat', icon: <MessageSquare className="w-4 h-4" /> },
      { label: 'Messages', section: 'messages', icon: <Mail className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Content',
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      { label: 'Blog', section: 'blog', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'Help Center', section: 'help-center', icon: <HelpCircle className="w-4 h-4" /> },
      { label: 'FAQ', section: 'faq', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    items: [
      { label: 'General', section: 'settings-general', icon: <Settings className="w-4 h-4" /> },
      { label: 'Security', section: 'settings-security', icon: <ShieldCheck className="w-4 h-4" /> },
      { label: 'Billing', section: 'settings-billing', icon: <CreditCard className="w-4 h-4" /> },
      { label: 'Integrations', section: 'settings-integrations', icon: <Zap className="w-4 h-4" /> },
      { label: 'Email Templates', section: 'settings-email', icon: <Mail className="w-4 h-4" /> },
      { label: 'Notifications', section: 'settings-notifications', icon: <Bell className="w-4 h-4" /> },
    ],
  },
  {
    label: 'System',
    icon: <Server className="w-4 h-4" />,
    items: [
      { label: 'Audit Logs', section: 'audit-logs', icon: <Activity className="w-4 h-4" /> },
      { label: 'System Health', section: 'system-health', icon: <Server className="w-4 h-4" /> },
    ],
  },
];

export function CompanyAdminPage() {
  const { state, dispatch } = useApp();
  const { theme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Business']);
  const [searchOpen, setSearchOpen] = useState(false);

  const currentSection = state.companyAdminSection;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const navigateTo = (section: CompanyAdminSection) => {
    dispatch({ type: 'SET_COMPANY_ADMIN_SECTION', payload: section });
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_VIEW', payload: 'landing' });
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const renderContent = () => {
    if (currentSection === 'shop-detail' && state.selectedManagedShop) {
      return <CompanyShopDetail />;
    }

    switch (currentSection) {
      case 'dashboard':
        return <CompanyDashboard />;
      case 'shops':
      case 'shop-verification':
      case 'shop-requests':
        return <CompanyShopList />;
      case 'subscription-plans':
      case 'coupons':
      case 'promotions':
        return <CompanyPlans />;
      case 'revenue-reports':
      case 'shop-reports':
      case 'usage-analytics':
      case 'growth':
        return <CompanyReports />;
      case 'tickets':
      case 'live-chat':
      case 'messages':
        return <CompanySupport />;
      case 'settings-general':
      case 'settings-security':
      case 'settings-billing':
      case 'settings-integrations':
      case 'settings-email':
      case 'settings-notifications':
        return <CompanySettings />;
      case 'audit-logs':
        return <CompanyAuditLogs />;
      case 'system-health':
        return <CompanySystemHealth />;
      default:
        return <CompanyDashboard />;
    }
  };

  // Sidebar content (shared between mobile and desktop)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight">Menuzo</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Admin Panel</span>
          </div>
        )}
      </div>

      {/* Dashboard Link */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => navigateTo('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentSection === 'dashboard'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Dashboard</span>}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                {group.icon}
                {!sidebarCollapsed && <span>{group.label}</span>}
              </div>
              {!sidebarCollapsed && (
                expandedGroups.includes(group.label)
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {expandedGroups.includes(group.label) && !sidebarCollapsed && (
              <div className="ml-2 mt-0.5 space-y-0.5 border-l border-border/30 pl-3">
                {group.items.map((item) => (
                  <button
                    key={item.section}
                    onClick={() => navigateTo(item.section)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                      currentSection === item.section
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Super Admin</p>
              <p className="text-[11px] text-muted-foreground truncate">admin@menuzo.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 
          bg-card/80 backdrop-blur-xl border-r border-border/50
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-[70px]' : 'w-[260px]'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden md:flex flex-col">
              <span className="text-sm font-semibold">{greeting}, Admin</span>
              <span className="text-[11px] text-muted-foreground">{dateStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:block">
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-1.5 border border-border/50">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search everything... (Ctrl+K)"
                    className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-muted-foreground/60"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                  <kbd className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-mono">ESC</kbd>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50 rounded-xl px-3 py-2 text-muted-foreground text-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">Search...</span>
                  <kbd className="text-[10px] bg-muted rounded px-1.5 py-0.5 font-mono hidden lg:inline">⌘K</kbd>
                </button>
              )}
            </div>

            {/* Active Users Badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 rounded-full px-3 py-1.5 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Users className="w-3 h-3" />
              <span>2,134 Online</span>
            </div>

            {/* Current Time */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-1.5">
              <Clock className="w-3 h-3" />
              <span>{timeStr}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="h-10 border-t border-border/50 bg-card/40 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-4">
            <span>Menuzo Admin v1.0.0</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Production</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>All systems operational</span>
            </div>
            <span className="hidden md:inline">© 2026 Menuzo</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
