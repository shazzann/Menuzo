import { ArrowRight, MessageCircle } from 'lucide-react';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import { getPublicWhatsAppUrl } from '@/lib/contact';

export function FinalCTASection() {
  const { state, dispatch } = useApp();
  const whatsappUrl = getPublicWhatsAppUrl(
    'Hello Menuzo, I would like to get started with a QR menu.'
  );

  const handlePrimaryClick = () => {
    trackEvent('hero_cta_clicked', { source: 'final_cta' });
    if (state.user) {
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
      return;
    }
    trackEvent('signup_started', { source: 'final_cta' });
    dispatch({ type: 'SET_VIEW', payload: 'signup' });
  };

  return (
    <div className="bg-[#12261F] text-[#F3F5F0] py-14 sm:py-20 border-t border-[#1F3A30]">
      <div className="landing-container flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
            Your next price change shouldn&apos;t mean another print run.
          </h2>
          <p className="text-base sm:text-lg text-[#D2D8CF] leading-relaxed">
            Create your digital menu and make updates whenever your restaurant needs them.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrimaryClick}
            className="landing-btn landing-btn-primary px-6 py-3.5 text-base"
          >
            Build my free menu
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_clicked', { source: 'final_cta' })}
              className="landing-btn bg-transparent text-white border border-[#5B6B63] hover:border-white px-5 py-3.5 text-base"
            >
              <MessageCircle className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
              Talk to us
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackEvent('whatsapp_clicked', { source: 'final_cta_contact' });
                dispatch({ type: 'SET_VIEW', payload: 'contact' });
              }}
              className="landing-btn bg-transparent text-white border border-[#5B6B63] hover:border-white px-5 py-3.5 text-base"
            >
              <MessageCircle className="w-4 h-4 text-[#F97316]" aria-hidden="true" />
              Talk to us
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
