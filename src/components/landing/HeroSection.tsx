import { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, MessageCircle, RotateCcw } from 'lucide-react';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import { getPublicWhatsAppUrl } from '@/lib/contact';

const DEFAULT_DISH_PRICE = 950;

export function HeroSection() {
  const { state, dispatch } = useApp();
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishPrice, setDishPrice] = useState(DEFAULT_DISH_PRICE);
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
      <div className="landing-container grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
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
                Talk to us
              </button>
            )}
          </div>

          <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#3D4A44]">
            <CheckCircle2 className="w-4 h-4 text-[#1F8A4C] shrink-0" aria-hidden="true" />
            <span>Free plan. No card. Your guests need no app.</span>
          </p>
        </div>

        {/* Right: Lightweight Interactive Owner -> Guest Menu Preview */}
        <div
          className="landing-card p-4 sm:p-5 bg-white"
          aria-label="Interactive menu update preview"
        >
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#EAECE6]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#3D4A44]">
                Live menu sync preview
              </p>
              <p className="text-xs text-[#3D4A44]">
                Try changing the dish below to see what guests see.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#12261F] border border-[#D2D8CF] rounded-[4px] hover:bg-[#F3F5F0] shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-4 items-start">
            {/* Owner Control */}
            <div className="border border-[#D2D8CF] rounded-[4px] p-3.5 bg-[#F3F5F0]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3D4A44] mb-3">
                Owner control
              </p>

              <div className="bg-white border border-[#D2D8CF] rounded-[4px] p-3 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#12261F]">Chicken Kottu</p>
                    <p className="text-xs text-[#3D4A44]">Mains</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-semibold ${
                      dishAvailable
                        ? 'bg-[#1F8A4C]/10 text-[#1F8A4C]'
                        : 'bg-[#C8372D]/10 text-[#C8372D]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        dishAvailable ? 'bg-[#1F8A4C]' : 'bg-[#C8372D]'
                      }`}
                      aria-hidden="true"
                    />
                    {dishAvailable ? 'Available' : 'Sold out'}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="hero-demo-price"
                    className="block text-xs font-medium text-[#3D4A44] mb-1"
                  >
                    Price (LKR)
                  </label>
                  <input
                    id="hero-demo-price"
                    type="text"
                    inputMode="numeric"
                    value={dishPrice === 0 ? '' : String(dishPrice)}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="950"
                    className="w-full h-10 px-3 text-sm font-semibold text-[#12261F] bg-white border border-[#B6C0B3] rounded-[4px] tabular-nums"
                  />
                </div>

                <button
                  type="button"
                  aria-pressed={!dishAvailable}
                  onClick={handleAvailabilityToggle}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-[4px] text-xs font-semibold border transition-colors ${
                    dishAvailable
                      ? 'border-[#C8372D] text-[#C8372D] bg-white hover:bg-[#C8372D]/5'
                      : 'border-[#1F8A4C] text-[#1F8A4C] bg-white hover:bg-[#1F8A4C]/5'
                  }`}
                >
                  {dishAvailable ? 'Mark as sold out' : 'Mark as available'}
                </button>
              </div>
            </div>

            {/* Guest Phone Preview */}
            <div className="mx-auto w-full max-w-[240px] sm:max-w-none bg-[#12261F] rounded-[18px] p-2.5 border border-[#12261F]">
              <div className="bg-white rounded-[12px] p-3 text-[#12261F]">
                <div className="pb-2 mb-2.5 border-b border-[#EAECE6]">
                  <p className="landing-serif text-sm font-semibold text-[#12261F]">
                    Ceylon Roast Café
                  </p>
                  <p className="text-[11px] text-[#3D4A44]">Guest view · Browser menu</p>
                </div>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start justify-between gap-2 pb-2 border-b border-[#EAECE6]">
                    <div className="min-w-0">
                      <p
                        className={`font-semibold truncate ${
                          dishAvailable ? 'text-[#12261F]' : 'text-[#3D4A44] line-through'
                        }`}
                      >
                        Chicken Kottu
                      </p>
                      <span
                        className={`inline-block mt-0.5 text-[10px] font-semibold ${
                          dishAvailable ? 'text-[#1F8A4C]' : 'text-[#C8372D]'
                        }`}
                      >
                        {dishAvailable ? 'Available' : 'Sold out'}
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums shrink-0 text-[#12261F]">
                      {formattedPrice}
                    </span>
                  </li>

                  <li className="flex items-start justify-between gap-2 pb-2 border-b border-[#EAECE6]">
                    <div>
                      <p className="font-semibold text-[#12261F]">Iced Milo</p>
                      <span className="text-[10px] font-medium text-[#1F8A4C]">Available</span>
                    </div>
                    <span className="font-semibold tabular-nums shrink-0">LKR 450</span>
                  </li>

                  <li className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#12261F]">Butter Croissant</p>
                      <span className="text-[10px] font-medium text-[#1F8A4C]">Available</span>
                    </div>
                    <span className="font-semibold tabular-nums shrink-0">LKR 520</span>
                  </li>
                </ul>

                <p className="mt-3 pt-2 border-t border-[#EAECE6] text-[10px] text-[#3D4A44] text-center">
                  Browse menu · Order with your server
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
