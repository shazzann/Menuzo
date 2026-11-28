import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="bg-[#12261F] text-[#F3F5F0] py-16 sm:py-20 border-t border-border">
      <div className="landing-container flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-3">
            Your next price change shouldn&apos;t mean another print run
          </h2>
          <p className="text-base sm:text-lg text-[#D2D8CF] leading-relaxed">
            Create your digital menu and make updates whenever your restaurant needs them.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            size="lg"
            onClick={handlePrimaryClick}
            className="h-12 px-6 rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium text-base transition-colors"
          >
            Build my free menu
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          </Button>

          {whatsappUrl ? (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-5 rounded-xl bg-transparent border-[#4B6158] text-[#F3F5F0] hover:bg-white/10 hover:text-white font-medium text-base transition-colors"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_clicked', { source: 'final_cta' })}
              >
                <MessageCircle className="w-4 h-4 text-[#D2D8CF]" strokeWidth={1.5} aria-hidden="true" />
                Chat with us on WhatsApp
              </a>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                trackEvent('whatsapp_clicked', { source: 'final_cta_contact' });
                dispatch({ type: 'SET_VIEW', payload: 'contact' });
              }}
              className="h-12 px-5 rounded-xl bg-transparent border-[#4B6158] text-[#F3F5F0] hover:bg-white/10 hover:text-white font-medium text-base transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#D2D8CF]" strokeWidth={1.5} aria-hidden="true" />
              Contact us
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
