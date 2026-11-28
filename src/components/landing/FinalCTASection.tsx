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
    <div className="landing-container pb-16 sm:pb-24">
      <div className="landing-reveal landing-final text-[#F3F5F0] px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
        <div className="max-w-2xl">
          <h2 className="landing-h2 text-white mb-5">
            Give your restaurant a menu that&apos;s easier to manage.
          </h2>
          <p className="landing-lede !text-[#D2D8CF]">
            Start free today and keep every table’s dishes, prices, and availability up to date.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            size="lg"
            onClick={handlePrimaryClick}
            className="landing-cta h-12 px-6 rounded-full bg-primary text-[#12261F] hover:bg-primary/95 font-semibold text-base"
          >
            Build my free menu
            <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleExploreClick}
            className="h-12 px-6 rounded-full bg-white/[0.04] border-white/20 text-[#F3F5F0] hover:bg-white/10 hover:text-white hover:border-white/35 dark:bg-white/[0.04] dark:border-white/20 dark:hover:bg-white/10 font-medium text-base transition-[color,background-color,border-color,transform] active:scale-[0.98]"
          >
            Explore Menuzo
          </Button>
        </div>
      </div>
    </div>
  );
}
