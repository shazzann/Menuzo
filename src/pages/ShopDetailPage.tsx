import { ArrowLeft, Phone, Clock, Mail, Globe, Instagram, Facebook, ExternalLink } from 'lucide-react';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import { LocationCard } from '@/components/shared/LocationCard';
import type { AdminTab } from '@/types';

export function ShopDetailPage() {
  const { state, dispatch } = useApp();
  const { shop } = state;

  const handleTabChange = (tab: AdminTab) => {
    if (tab === 'menu-preview') {
      dispatch({ type: 'SET_VIEW', payload: 'customer-menu' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
        {shop.banner ? (
          <img
            src={shop.banner}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-sm z-10 relative">No banner available</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'customer-menu' })}
          className="absolute top-4 left-4 p-2.5 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Shop Info */}
      <div className="relative -mt-16 px-4">
        <div className="bg-card rounded-3xl card-border card-shadow p-5">
          {/* Logo & Name */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border bg-muted flex-shrink-0 flex items-center justify-center">
              {shop.logo ? (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">
                  {shop.name ? shop.name.charAt(0).toUpperCase() : 'S'}
                </span>
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{shop.name}</h1>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full ${
                    shop.isOpen
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {shop.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{shop.tagline}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {shop.description}
          </p>

          {/* Location */}
          {shop.location && (
            <div className="mb-8">
              <LocationCard location={shop.location} />
            </div>
          )}

          {/* Contact Actions */}
          <div className="space-y-3 mb-8">
            {shop.contacts && shop.contacts.filter(c => c.isVisible).length > 0 ? (
              shop.contacts.filter(c => c.isVisible).map(contact => (
                <a key={contact.id} href={`tel:${contact.number.replace(/\s+/g, '')}`} className="flex items-center gap-3.5 p-4 rounded-[16px] bg-muted hover:bg-muted/80 transition-colors">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-foreground">{contact.label}</span>
                    <span className="text-[13px] text-muted-foreground mt-0.5">{contact.number}</span>
                  </div>
                </a>
              ))
            ) : shop.contactNumber ? (
              <a href={`tel:${shop.contactNumber.replace(/\s+/g, '')}`} className="flex items-center gap-3.5 p-4 rounded-[16px] bg-muted hover:bg-muted/80 transition-colors">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-foreground">Contact</span>
                  <span className="text-[13px] text-muted-foreground mt-0.5">{shop.contactNumber}</span>
                </div>
              </a>
            ) : null}

            {shop.email && (
              <a href={`mailto:${shop.email}`} className="flex items-center gap-3.5 p-4 rounded-[16px] bg-muted hover:bg-muted/80 transition-colors">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-foreground">Email</span>
                  <span className="text-[13px] text-muted-foreground mt-0.5">{shop.email}</span>
                </div>
              </a>
            )}
          </div>

          {/* Opening Hours */}
          <div className="mb-8">
            <h3 className="font-semibold text-[15px] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Opening Hours
            </h3>
            <div className="space-y-2">
              {shop.openingHours.map((schedule, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-[16px] ${schedule.isSpecialDay ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}
                >
                  <span className={`text-[14px] ${schedule.isSpecialDay ? 'font-semibold text-primary' : 'font-semibold'}`}>
                    {schedule.isSpecialDay ? (schedule.date || 'Special Day') : schedule.day}
                  </span>
                  <span className={`text-[13px] font-mono ${schedule.isSpecialDay ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          {shop.socialLinks && (
            <div className="mb-8">
              <h3 className="font-semibold text-[15px] mb-3">Follow Us</h3>
              <div className="flex flex-wrap gap-2.5">
                {shop.socialLinks.instagram && (
                  <a
                    href={`https://instagram.com/${shop.socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Instagram className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-medium">{shop.socialLinks.instagram}</span>
                  </a>
                )}
                {shop.socialLinks.facebook && (
                  <a
                    href={`https://facebook.com/${shop.socialLinks.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Facebook className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-medium">Facebook</span>
                  </a>
                )}
                {shop.socialLinks.website && (
                  <a
                    href={`https://${shop.socialLinks.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Globe className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-medium">Website</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="shop-details"
        onTabChange={handleTabChange}
        isAdmin={false}
      />
    </div>
  );
}
