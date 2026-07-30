import { ArrowLeft, Phone, Clock, Mail, Globe, Instagram, Facebook, ExternalLink } from 'lucide-react';
import { useApp } from '@/store';
import { BottomNav } from '@/components/shared/BottomNav';
import { LocationCard } from '@/components/shared/LocationCard';
import type { AdminTab } from '@/types';
import { checkShopStatus, filterExpiredSpecialDates } from '@/lib/timeUtils';

export function ShopDetailPage() {
  const { state, dispatch } = useApp();
  const { shop } = state;

  const handleTabChange = (tab: AdminTab) => {
    if (tab === 'menu-preview') {
      dispatch({ type: 'SET_VIEW', payload: 'customer-menu' });
    }
  };

  const timeStatus = checkShopStatus(shop.openingHours);
  const isCurrentlyOpen = shop.isOpen && timeStatus.isOpen;

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
                    isCurrentlyOpen
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCurrentlyOpen ? 'Open' : 'Closed'}
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
          <div className="mb-10">
            <h3 className="font-bold text-[17px] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Opening Hours
            </h3>
            
            {shop.openingHours.length > 0 ? (
              <div className="space-y-6">
                {/* Today Status Card */}
                <div className="bg-muted/50 rounded-2xl p-5 border border-border/50">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="relative flex h-3 w-3">
                      {isCurrentlyOpen && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isCurrentlyOpen ? 'bg-primary' : 'bg-muted-foreground'}`}></span>
                    </span>
                    <span className={`font-semibold text-[15px] ${isCurrentlyOpen ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isCurrentlyOpen ? 'Open Now' : 'Closed Now'}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground ml-6">
                    {timeStatus.nextActionTime 
                      ? `${isCurrentlyOpen ? 'Closes' : 'Opens'} at ${timeStatus.nextActionTime}` 
                      : (timeStatus.reason ? `Special: ${timeStatus.reason}` : '')
                    }
                  </p>
                </div>

                {/* Weekly Schedule */}
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                  <div className="divide-y divide-border/40">
                    {(() => {
                      const now = new Date();
                      const dayNameStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Colombo', weekday: 'long' }).format(now);
                      const dayMap: Record<string, number> = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
                      const currentDayOfWeek = dayMap[dayNameStr];
                      
                      const sortDay = (day: number) => day === 0 ? 7 : day;
                      const regularHours = [...shop.openingHours]
                        .filter(s => s.type === 'regular')
                        .sort((a, b) => sortDay(a.dayOfWeek ?? 0) - sortDay(b.dayOfWeek ?? 0));

                      return regularHours.map((schedule, index) => {
                        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek ?? 0];
                        const isToday = schedule.dayOfWeek === currentDayOfWeek;
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-4 ${isToday ? 'bg-primary/5' : ''}`}
                          >
                            <span className={`text-[14px] ${isToday ? 'font-bold text-foreground' : (schedule.isOpen ? 'font-medium text-foreground/80' : 'font-medium text-muted-foreground')}`}>
                              {dayName} {isToday && <span className="text-[11px] font-bold text-primary ml-1.5 uppercase tracking-wide">Today</span>}
                            </span>
                            <span className={`text-[14px] ${schedule.isOpen ? 'text-foreground font-mono' : 'text-muted-foreground/70 font-medium'}`}>
                              {schedule.isOpen ? `${schedule.openTime} – ${schedule.closeTime}` : 'Closed'}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Special Hours */}
                {(() => {
                  const specialHours = filterExpiredSpecialDates([...shop.openingHours])
                    .filter(s => s.type === 'special')
                    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

                  if (specialHours.length === 0) return null;

                  return (
                    <div className="pt-2">
                      <h4 className="font-semibold text-[14px] text-muted-foreground mb-3 px-1 uppercase tracking-wider">
                        Special Dates
                      </h4>
                      <div className="space-y-2">
                        {specialHours.map((schedule, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-[16px] bg-muted/40 border border-border/30">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[14px] font-semibold text-foreground">
                                {schedule.reason || 'Special Day'}
                              </span>
                              <span className="text-[12px] text-muted-foreground font-medium">
                                {schedule.date 
                                  ? new Date(schedule.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                  : ''}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${schedule.isOpen ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                                {schedule.isOpen ? 'Open' : 'Closed'}
                              </span>
                              {schedule.isOpen && (
                                <span className="text-[13px] font-mono text-muted-foreground">
                                  {schedule.openTime} – {schedule.closeTime}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-[14px] text-muted-foreground italic bg-muted/30 p-4 rounded-xl border border-border/50 text-center">
                No opening hours available.
              </div>
            )}
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
