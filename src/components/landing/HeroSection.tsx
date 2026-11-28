import { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, MessageCircle, RotateCcw } from 'lucide-react';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import { getPublicWhatsAppUrl } from '@/lib/contact';

const LIVE_MENU_URL = 'https://menuzo.lk/spicegardenkitchen';
const DEFAULT_DISH_PRICE = 1350;

export function HeroSection() {
  const { state, dispatch } = useApp();
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishPrice, setDishPrice] = useState(DEFAULT_DISH_PRICE);
  const [previewImgError, setPreviewImgError] = useState(false);
  const hasInteractedRef = useRef(false);

  const whatsappUrl = getPublicWhatsAppUrl(
    'Hello Menuzo, I would like to learn more about setting up a digital QR menu.'
  );

  const recordFirstDemoInteraction = () => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      trackEvent('demo_first_interaction', { source: 'hero_demo' });
    }
  };

  const handleAvailabilityToggle = () => {
    recordFirstDemoInteraction();
    const next = !dishAvailable;
    setDishAvailable(next);
    trackEvent('demo_toggled', {
      control: 'availability',
      value: next ? 'available' : 'sold_out',
    });
  };

  const handlePriceChange = (raw: string) => {
    recordFirstDemoInteraction();
    const digits = raw.replace(/\D/g, '').slice(0, 5);
    const parsed = digits ? Number(digits) : 0;
    setDishPrice(parsed);
    trackEvent('demo_toggled', {
      control: 'price',
      value: parsed,
    });
  };

  const handleReset = () => {
    recordFirstDemoInteraction();
    setDishAvailable(true);
    setDishPrice(DEFAULT_DISH_PRICE);
    trackEvent('demo_toggled', { control: 'reset', value: 'default' });
  };

  const handlePrimaryCTA = () => {
    trackEvent('hero_cta_clicked', { source: 'hero' });
    if (state.user) {
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
      return;
    }
    trackEvent('signup_started', { source: 'hero' });
    dispatch({ type: 'SET_VIEW', payload: 'signup' });
  };

  const handleContactFallback = () => {
    trackEvent('whatsapp_clicked', { source: 'hero_contact_fallback' });
    dispatch({ type: 'SET_VIEW', payload: 'contact' });
  };

  const formattedPrice = `LKR ${(dishPrice || 0).toLocaleString('en-US')}`;

  return (
    <section id="home" className="pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-[#D2D8CF]">
      <div className="landing-container grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-12 items-center">
        {/* Left: Core Product Message & Conversion CTAs */}
        <div className="max-w-xl">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] text-[#3D4A44] mb-3">
            A simpler way to manage your restaurant menu
          </p>

          <h1 className="text-3xl sm:text-5xl font-bold leading-[1.08] text-[#12261F] mb-5">
            Update your menu once. Every table sees it instantly.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-[#3D4A44] mb-7">
            Menuzo gives Sri Lankan cafés and restaurants a QR menu you can change any time, so prices and sold-out dishes are always right.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <button
              type="button"
              onClick={handlePrimaryCTA}
              className="landing-btn landing-btn-primary w-full sm:w-auto px-6 py-3.5 text-base"
            >
              Build my free menu
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_clicked', { source: 'hero' })}
                className="landing-btn landing-btn-secondary w-full sm:w-auto px-5 py-3.5 text-base"
              >
                <MessageCircle className="w-4 h-4 text-[#1F8A4C]" aria-hidden="true" />
                Chat with us on WhatsApp
              </a>
            ) : (
              <button
                type="button"
                onClick={handleContactFallback}
                className="landing-btn landing-btn-secondary w-full sm:w-auto px-5 py-3.5 text-base"
              >
                <MessageCircle className="w-4 h-4 text-[#1F8A4C]" aria-hidden="true" />
                Contact us
              </button>
            )}
          </div>

          <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#3D4A44]">
            <CheckCircle2 className="w-4 h-4 text-[#1F8A4C] shrink-0" aria-hidden="true" />
            <span>Free plan. No card. Your guests need no app.</span>
          </p>
        </div>

        {/* Right: Real Live Menuzo Customer Menu + Compact Interactive Sync Preview */}
        <div
          className="landing-card p-4 sm:p-5 bg-white"
          aria-label="Live Menuzo menu example and instant update preview"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#EAECE6]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#3D4A44]">
                Live product example
              </p>
              <p className="text-sm font-semibold text-[#12261F]">
                Spice Garden Kitchen · Live Menuzo QR menu
              </p>
            </div>
            <a
              href={LIVE_MENU_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent('demo_first_interaction', { source: 'hero_live_menu_link' })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#12261F] bg-[#F3F5F0] border border-[#B6C0B3] rounded-[4px] hover:border-[#12261F] transition-colors shrink-0"
            >
              Explore a live menu
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-start">
            {/* Real Product Screenshot (Static, Optimized WebP, No Iframe) */}
            <div className="mx-auto w-[190px] sm:w-[200px] bg-[#12261F] rounded-[16px] p-2 border border-[#12261F] shrink-0">
              <div className="bg-[#090A0C] rounded-[11px] overflow-hidden aspect-[460/927]">
                {previewImgError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white">
                    <p className="landing-serif text-sm font-semibold mb-1">Spice Garden Kitchen</p>
                    <p className="text-xs text-[#D2D8CF] mb-3">
                      Live digital QR menu running on Menuzo.
                    </p>
                    <a
                      href={LIVE_MENU_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#F97316] underline"
                    >
                      Open live menu
                    </a>
                  </div>
                ) : (
                  <img
                    src="/Landing/spice-garden-menu.webp"
                    alt="Spice Garden Kitchen live digital QR menu preview on Menuzo"
                    width={460}
                    height={927}
                    fetchPriority="high"
                    onError={() => setPreviewImgError(true)}
                    className="w-full h-full object-cover object-top block"
                  />
                )}
              </div>
            </div>

            {/* Right Column: QR to Live Menu + Compact Owner/Guest Sync Demo */}
            <div className="space-y-3 min-w-0">
              {/* Scan QR + Link */}
              <div className="flex items-center gap-3 p-3 rounded-[4px] border border-[#D2D8CF] bg-[#F3F5F0]">
                <img
                  src="/Landing/spice-garden-qr.svg"
                  alt="QR code for Spice Garden Kitchen live Menuzo menu"
                  width={76}
                  height={76}
                  className="w-[72px] h-[72px] rounded-[4px] bg-white border border-[#D2D8CF] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#12261F] mb-0.5">
                    Scan on your phone
                  </p>
                  <p className="text-xs text-[#3D4A44] leading-snug mb-1.5">
                    Opens directly in any mobile browser. No app needed.
                  </p>
                  <a
                    href={LIVE_MENU_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent('demo_first_interaction', { source: 'hero_qr_link' })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#12261F] underline underline-offset-2 hover:text-[#F97316]"
                  >
                    Open in new tab
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Compact Owner -> Guest Sync Interaction */}
              <div className="border border-[#D2D8CF] rounded-[4px] p-3 bg-white space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3D4A44]">
                    Try an instant update
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#12261F] border border-[#D2D8CF] rounded-[4px] hover:bg-[#F3F5F0]"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="hero-demo-price"
                      className="block text-[11px] font-medium text-[#3D4A44] mb-1"
                    >
                      Dish price (LKR)
                    </label>
                    <input
                      id="hero-demo-price"
                      type="text"
                      inputMode="numeric"
                      value={dishPrice === 0 ? '' : String(dishPrice)}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="1350"
                      className="w-full h-9 px-2.5 text-sm font-semibold text-[#12261F] bg-white border border-[#B6C0B3] rounded-[4px] tabular-nums"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      aria-pressed={!dishAvailable}
                      onClick={handleAvailabilityToggle}
                      className={`w-full h-9 px-2.5 rounded-[4px] text-xs font-semibold border transition-colors ${
                        dishAvailable
                          ? 'border-[#C8372D] text-[#C8372D] bg-white hover:bg-[#C8372D]/5'
                          : 'border-[#1F8A4C] text-[#1F8A4C] bg-white hover:bg-[#1F8A4C]/5'
                      }`}
                    >
                      {dishAvailable ? 'Mark sold out' : 'Mark available'}
                    </button>
                  </div>
                </div>

                {/* Synced Guest View Row */}
                <div
                  className="pt-2 border-t border-[#EAECE6] flex items-center justify-between gap-2 text-xs"
                  aria-live="polite"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] text-[#3D4A44] block">Guest view:</span>
                    <span
                      className={`font-semibold ${
                        dishAvailable ? 'text-[#12261F]' : 'text-[#3D4A44] line-through'
                      }`}
                    >
                      Chicken Kottu
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                        dishAvailable
                          ? 'bg-[#1F8A4C]/10 text-[#1F8A4C]'
                          : 'bg-[#C8372D]/10 text-[#C8372D]'
                      }`}
                    >
                      {dishAvailable ? 'Available' : 'Sold out'}
                    </span>
                    <span className="font-bold text-[#12261F] tabular-nums">{formattedPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
