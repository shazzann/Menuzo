import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';

export function FinalCTASection() {
  const { state, dispatch } = useApp();

  const handlePrimaryClick = () => {
    trackEvent('hero_cta_clicked', { source: 'final_cta' });
    if (state.user) {
      dispatch({ type: 'SET_VIEW', payload: 'user-dashboard' });
      return;
    }
    trackEvent('signup_started', { source: 'final_cta' });
    dispatch({ type: 'SET_VIEW', payload: 'signup' });
  };

  const handleExploreClick = () => {
    const target = document.getElementById('product');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-[#12261F] text-[#F3F5F0] py-16 sm:py-20 border-t border-[#243E35]">
      <div className="landing-container flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-3">
            Give your restaurant a menu that&apos;s easier to manage.
          </h2>
          <p className="text-base sm:text-lg text-[#D2D8CF] leading-relaxed">
            Start free today and keep every table’s dishes, prices, and availability up to date.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            size="lg"
            onClick={handlePrimaryClick}
            className="h-12 px-6 rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium text-base transition-[color,background-color,transform] active:scale-[0.98]"
          >
            Build my free menu
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleExploreClick}
            className="h-12 px-5 rounded-xl bg-transparent border-[#4B6158] text-[#F3F5F0] hover:bg-white/10 hover:text-white font-medium text-base transition-[color,background-color,transform] active:scale-[0.98]"
          >
            Explore Menuzo
          </Button>
        </div>
      </div>
    </div>
  );
}
