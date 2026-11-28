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
    <div className="bg-[#0A0B0D] text-[#F5F7FA] py-14 sm:py-20 border-t border-border">
      <div className="landing-container flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Your next price change shouldn&apos;t mean another print run.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Create your digital menu and make updates whenever your restaurant needs them.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            size="lg"
            onClick={handlePrimaryClick}
            className="h-12 px-6 rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-semibold text-base"
          >
            Build my free menu
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>

          {whatsappUrl ? (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-5 rounded-xl bg-transparent border-slate-600 text-white hover:bg-white/10 hover:text-white font-semibold text-base"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_clicked', { source: 'final_cta' })}
              >
                <MessageCircle className="w-4 h-4 text-primary" aria-hidden="true" />
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
              className="h-12 px-5 rounded-xl bg-transparent border-slate-600 text-white hover:bg-white/10 hover:text-white font-semibold text-base"
            >
              <MessageCircle className="w-4 h-4 text-primary" aria-hidden="true" />
              Contact us
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
