import { ArrowLeft, MapPin, Phone, Clock, Mail, Globe, Instagram, Facebook, ExternalLink } from 'lucide-react';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';

export function ShopDetailPage() {
  const { state, dispatch } = useApp();
  const { shop } = state;

  const handleTabChange = (tab: string) => {
    if (tab === 'menu-preview') {
      dispatch({ type: 'SET_VIEW', payload: 'customer-menu' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={shop.banner}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
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
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border bg-muted flex-shrink-0">
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
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

          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            <div>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(shop.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors mb-2">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-foreground">Location</p>
                  <p className="text-sm text-primary hover:underline">{shop.location}</p>
                </div>
              </a>
              {shop.location && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-border">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
              <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Contact</p>
                <p className="text-sm text-muted-foreground">{shop.contactNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Email</p>
                <p className="text-sm text-muted-foreground">{shop.email}</p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Opening Hours
            </h3>
            <div className="space-y-2">
              {shop.openingHours.map((schedule, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${schedule.isSpecialDay ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}
                >
                  <span className={`text-sm ${schedule.isSpecialDay ? 'font-medium text-primary' : ''}`}>
                    {schedule.isSpecialDay ? (schedule.date || 'Special Day') : schedule.day}
                  </span>
                  <span className={`text-sm font-mono ${schedule.isSpecialDay ? 'text-primary' : 'text-muted-foreground'}`}>
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          {shop.socialLinks && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Follow Us</h3>
              <div className="flex flex-wrap gap-3">
                {shop.socialLinks.instagram && (
                  <a
                    href={`https://instagram.com/${shop.socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm">{shop.socialLinks.instagram}</span>
                  </a>
                )}
                {shop.socialLinks.facebook && (
                  <a
                    href={`https://facebook.com/${shop.socialLinks.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="text-sm">Facebook</span>
                  </a>
                )}
                {shop.socialLinks.website && (
                  <a
                    href={`https://${shop.socialLinks.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
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
