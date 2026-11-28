import { ArrowUpRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import { getPublicEmailUrl, getPublicWhatsAppUrl } from '@/lib/contact';

const partnerAudiences = [
  'Digital marketing agencies',
  'Web and branding studios',
  'Restaurant consultants',
  'Hospitality technology resellers',
];

export function PartnersSection() {
  const partnerMessage =
    'Hello Menuzo, I would like to discuss a business partnership opportunity.';
  const whatsappUrl = getPublicWhatsAppUrl(partnerMessage);
  const partnerHref =
    whatsappUrl || getPublicEmailUrl('Menuzo Partnership Enquiry', partnerMessage);

  return (
    <section
      id="partners"
      className="bg-[#12261F] text-[#F3F5F0] border-b border-[#243E35] py-16 sm:py-20"
    >
      <div className="landing-container grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
        <div className="max-w-xl">
          <p className="text-xs font-medium text-primary mb-2.5">
            For business partners
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-3">
            Grow with Menuzo.
          </h2>
          <p className="text-base sm:text-lg text-[#D2D8CF] leading-relaxed mb-7">
            Help restaurants move towards smarter digital menus while building a partnership with Menuzo. Connect with our team directly to discuss partnership opportunities for your hospitality clients.
          </p>

          <Button
            size="lg"
            asChild
            className="h-12 px-6 rounded-xl bg-primary text-[#12261F] hover:bg-primary/90 font-medium text-base w-full sm:w-auto transition-[color,background-color,transform] active:scale-[0.98]"
          >
            <a
              href={partnerHref}
              target={whatsappUrl ? '_blank' : undefined}
              rel={whatsappUrl ? 'noopener noreferrer' : undefined}
              onClick={() =>
                trackEvent('whatsapp_clicked', {
                  source: whatsappUrl ? 'partners_whatsapp' : 'partners_email',
                })
              }
            >
              Become a partner
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
          </Button>
        </div>

        <div className="rounded-2xl border border-[#243E35] bg-[#0F201A] p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 text-sm font-medium text-white">
            <Briefcase className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>Who we work with</span>
          </div>
          <ul className="space-y-3 border-t border-[#243E35] pt-4">
            {partnerAudiences.map((partner) => (
              <li
                key={partner}
                className="flex items-center gap-2.5 text-sm text-[#D2D8CF]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                <span>{partner}</span>
              </li>
            ))}
          </ul>
          <p className="pt-3 border-t border-[#243E35] text-xs text-[#A8B4AC] leading-relaxed">
            Partnership terms and onboarding support are discussed directly based on client fit.
          </p>
        </div>
      </div>
    </section>
  );
}
