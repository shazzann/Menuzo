import { useState } from 'react';
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  AlertCircle, 
  Scale, 
  Sparkles,
  Lock,
  Mail,
  Clock,
  Database,
  Cloud,
  UserCheck,
  Server,
  Globe2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useApp } from '@/store';
import { FREE_PLAN_LIMITS, PRO_PLAN_LIMITS, PRO_GRACE_DAYS, PRO_ENDING_SOON_DAYS } from '@/lib/subscription';

export function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const { dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(type);

  const handleTabChange = (tab: 'terms' | 'privacy') => {
    setActiveTab(tab);
    dispatch({ type: 'SET_VIEW', payload: tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isTerms = activeTab === 'terms';
  const lastUpdated = 'October 28, 2026';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sticky Top Header */}
      <header className="h-16 bg-background/95 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })} 
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> 
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </Button>

        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
          title="Menuzo Home"
        >
          <img src="/logo/Logo main4tight.png" alt="Menuzo" className="h-7 w-auto dark:hidden" />
          <img src="/logo/Logo main4dark.png" alt="Menuzo" className="h-7 w-auto hidden dark:block" />
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-10 sm:py-16 px-4 sm:px-6">
        
        {/* Document Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center p-1.5 rounded-full bg-muted/60 border border-border shadow-xs backdrop-blur-sm">
            <button
              type="button"
              onClick={() => handleTabChange('terms')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isTerms
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Terms & Conditions
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('privacy')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                !isTerms
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Header Title & Date */}
        <div className="text-center mb-10 pb-8 border-b border-border/70">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-3">
            {isTerms ? <FileText className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            {isTerms ? 'Legal Agreement' : 'Data Protection Policy'}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {isTerms ? 'Terms & Conditions' : 'Privacy Policy'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective Date & Last Updated: <span className="font-medium text-foreground">{lastUpdated}</span>
          </p>
        </div>

        {/* Legal Status Notice Alert */}
        <div className="mb-10 p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200/90 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-semibold text-amber-300">
              Draft Policy · Pending Professional Legal Review
            </p>
            <p className="text-muted-foreground dark:text-neutral-300 text-xs leading-relaxed">
              Menuzo is an independent digital restaurant menu software platform developed in Sri Lanka by Hasni Zihar and Shazan. Menuzo is currently operating as an unincorporated proprietary software project and is not yet registered as an incorporated legal entity under the Companies Act of Sri Lanka. This Privacy Policy outlines our real technical data collection practices, database architecture, third-party cloud services, and user privacy rights. It is provided as a working draft subject to final review by a qualified Sri Lankan Attorney-at-Law.
            </p>
          </div>
        </div>

        {isTerms ? (
          /* ========================================================================= */
          /* TERMS & CONDITIONS CONTENT                                                */
          /* ========================================================================= */
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
            
            {/* 1. Introduction & Acceptance */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">01.</span> Introduction & Acceptance of Terms
              </h2>
              <p>
                Welcome to <strong className="text-foreground">Menuzo</strong> (<span className="text-primary font-mono text-xs">menuzo.app</span>), a digital restaurant menu SaaS platform designed and operated in Sri Lanka. These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Menuzo platform, mobile menu viewer, QR code features, and related administrative dashboards (collectively, the &ldquo;Service&rdquo;).
              </p>
              <p>
                By creating an account, publishing a digital menu, sharing or displaying a Menuzo QR code, or browsing any digital menu hosted on Menuzo, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <button type="button" onClick={() => handleTabChange('privacy')} className="text-primary hover:underline font-semibold inline">Privacy Policy</button>. If you do not agree to these Terms, you must immediately refrain from accessing or using the Service.
              </p>
            </section>

            {/* 2. Eligibility & User Roles */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">02.</span> Eligibility & User Roles
              </h2>
              <p>
                The Service accommodates four distinct user roles, each subject to specific rights and responsibilities:
              </p>
              <ul className="space-y-2.5 list-disc pl-5">
                <li>
                  <strong className="text-foreground">Restaurant Owners:</strong> The primary account holder who creates and configures a restaurant on Menuzo via Google authentication. Owners must be at least 18 years of age and hold legal authorization to represent the restaurant or food business.
                </li>
                <li>
                  <strong className="text-foreground">Authorized Managers & Staff:</strong> Personnel permitted by the restaurant owner to manage menu items, pricing, or appearance. The restaurant owner remains strictly and fully liable for all actions, uploads, and modifications performed by authorized staff.
                </li>
                <li>
                  <strong className="text-foreground">Customers & Diners:</strong> End users who scan QR codes or open shareable menu links to view digital menus. Customers browse menus freely without creating an account and are never charged by Menuzo.
                </li>
                <li>
                  <strong className="text-foreground">Dealers & Independent Partners:</strong> Promotional partners who introduce restaurants to Menuzo. Dealers are independent contractors and have no authority to bind Menuzo to separate legal commitments or altered pricing.
                </li>
              </ul>
            </section>

            {/* 3. Account Registration & Security */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">03.</span> Account Registration & Security
              </h2>
              <p>
                To access the restaurant management dashboard, you must authenticate using a verified Google account. Menuzo enforces a policy of <strong className="text-foreground">one restaurant profile per Google account</strong>.
              </p>
              <p>
                You are solely responsible for maintaining the confidentiality of your Google credentials and all activity conducted through your account. You agree to notify Menuzo immediately at <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline font-medium">menuzoapp@gmail.com</a> upon detecting any unauthorized access or security breach. Menuzo cannot and will not be liable for losses caused by compromised login credentials.
              </p>
            </section>

            {/* 4. Nature of the Service (Display Only) */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">04.</span> Nature of Service (Menu Display Only)
              </h2>
              <p>
                Menuzo provides interactive digital menu hosting, QR code generation, theme styling, and basic aggregate visit analytics.
              </p>
              <div className="p-4 rounded-xl bg-muted/60 border border-border/60 text-xs sm:text-sm text-foreground space-y-1">
                <p className="font-semibold text-primary">Important Clarification on Food & Orders:</p>
                <p className="text-muted-foreground leading-relaxed">
                  Menuzo is exclusively a menu display and presentation software. Menuzo does <strong>NOT</strong> process food orders, table bookings, customer payments for meals, food preparation, or delivery logistics. Any transaction, dining arrangement, or food order is contracted solely and directly between the customer and the restaurant.
                </p>
              </div>
            </section>

            {/* 5. Subscription Plans & Limitations */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">05.</span> Subscription Plans & Feature Matrix
              </h2>
              <p>
                Menuzo offers two subscription tiers: <strong className="text-foreground">Free</strong> and <strong className="text-foreground">Pro</strong>. Feature access is programmatically enforced based on your active subscription status:
              </p>

              {/* Feature Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-border/80 my-4">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/80 text-foreground font-semibold border-b border-border/80">
                    <tr>
                      <th className="py-3 px-4">Feature</th>
                      <th className="py-3 px-4">Free Plan</th>
                      <th className="py-3 px-4 text-primary font-bold">Pro Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-normal">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Food Items</td>
                      <td className="py-2.5 px-4">{FREE_PLAN_LIMITS.items} items</td>
                      <td className="py-2.5 px-4 text-foreground font-semibold">{PRO_PLAN_LIMITS.items} items</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Categories</td>
                      <td className="py-2.5 px-4">{FREE_PLAN_LIMITS.categories} categories</td>
                      <td className="py-2.5 px-4 text-foreground font-semibold">{PRO_PLAN_LIMITS.categories} categories</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">QR Menu Generation</td>
                      <td className="py-2.5 px-4 text-emerald-400">Included</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-semibold">Included</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Custom Themes</td>
                      <td className="py-2.5 px-4">Limited (5 curated presets)</td>
                      <td className="py-2.5 px-4 text-foreground font-semibold">Full Customization & Premium Themes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Custom QR Branding</td>
                      <td className="py-2.5 px-4">Basic (Classic square)</td>
                      <td className="py-2.5 px-4 text-foreground font-semibold">Advanced (Brand colors & rounded styles)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Analytics Dashboard</td>
                      <td className="py-2.5 px-4 text-neutral-500">Not Included</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-semibold">Included (Views & Scans)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Restaurant Profile</td>
                      <td className="py-2.5 px-4 text-emerald-400">Included</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-semibold">Included</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Shareable Menu Link</td>
                      <td className="py-2.5 px-4 text-emerald-400">Included</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-semibold">Included</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Custom Menu URL</td>
                      <td className="py-2.5 px-4 text-neutral-500">Not Included</td>
                      <td className="py-2.5 px-4 text-foreground font-semibold">Included (subject to availability)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-foreground">Support</td>
                      <td className="py-2.5 px-4">Standard Email Support</td>
                      <td className="py-2.5 px-4 text-primary font-semibold">Priority Support</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-2">
                <p>
                  <strong className="text-foreground">Pro Subscription Rates:</strong> Pro access fees are quoted in Sri Lankan Rupees (LKR) and published on our website checkout:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li><strong className="text-foreground">Monthly Billing:</strong> LKR 1,500 – LKR 3,500 per month (as quoted on checkout).</li>
                  <li><strong className="text-foreground">Annual Billing (12 Months):</strong> LKR 15,000 – LKR 33,600 per year (reflecting discounted annual rates).</li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Published pricing is subject to periodic promotional rates or adjustments. Active subscriptions remain honored for their pre-paid duration.
                </p>
              </div>
            </section>

            {/* 6. Payments & Activation */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">06.</span> Payments & Subscription Activation
              </h2>
              <p>
                Menuzo supports manual bank transfer payments for all subscription purchases:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong className="text-foreground">Bank Transfer:</strong> The restaurant transfers the quoted subscription fee to Menuzo&apos;s designated Sri Lankan bank account displayed during checkout.
                </li>
                <li>
                  <strong className="text-foreground">Payment Confirmation via WhatsApp:</strong> The restaurant submits their payment slip, payer name, and transaction reference through Menuzo&apos;s designated WhatsApp verification channel.
                </li>
                <li>
                  <strong className="text-foreground">Administrative Verification:</strong> Pro features are manually verified and activated by our team upon confirmation of received funds (typically within 1 to 24 hours).
                </li>
                <li>
                  <strong className="text-foreground">Manual Renewals:</strong> All subscription renewals are strictly manual. Menuzo does not maintain automated recurring card debits. Subscriptions must be re-confirmed and renewed before expiry.
                </li>
              </ol>
            </section>

            {/* 7. Expiry, Grace Period & Downgrades */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">07.</span> Expiry, Grace Period & Excess Item Policy
              </h2>
              <p>
                Our subscription lifecycle is governed by automated verification rules:
              </p>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> 7-Day Expiry Notice:
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Starting {PRO_ENDING_SOON_DAYS} days before your Pro subscription concludes, a renewal alert appears on your dashboard indicating the upcoming expiry date.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> {PRO_GRACE_DAYS}-Day Grace Period:
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Following the expiration of your Pro plan, Menuzo provides a mandatory <strong>{PRO_GRACE_DAYS}-day grace period</strong> during which all menu items and categories remain fully active and publicly accessible without interruption.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-neutral-400" /> Downgrade & Excess Items Handling:
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    If renewal is not completed before the {PRO_GRACE_DAYS}-day grace period concludes, the restaurant automatically reverts to the Free plan. Public digital menus will immediately display only your first <strong>{FREE_PLAN_LIMITS.categories} categories</strong> and up to <strong>{FREE_PLAN_LIMITS.items} food items</strong>. Any menu items exceeding Free tier allowances are hidden from public view.
                  </p>
                  <p className="text-muted-foreground mt-1.5">
                    <strong className="text-foreground">Important: Excess items are NEVER deleted.</strong> In your restaurant owner dashboard, all items remain safely stored. Hidden items are clearly labeled with an alert badge, allowing you to reorder categories to select which items appear publicly or upgrade back to Pro at any time.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Refunds & Cancellations */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">08.</span> Refunds & Cancellations
              </h2>
              <p>
                You may cancel your subscription or decide not to renew at any time. Because Menuzo subscriptions are activated manually following administrative verification of digital access, fees paid are generally non-refundable once an activation is complete.
              </p>
              <p>
                Refund requests arising from proven duplicate bank transfers or technical activation failures attributable to Menuzo are evaluated on a case-by-case basis. To submit a refund review, email <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline font-medium">menuzoapp@gmail.com</a> accompanied by bank transfer receipts within seven (7) days of payment. Menuzo does not issue automated pro-rata refunds for partial months or unused periods.
              </p>
            </section>

            {/* 9. Restaurant Responsibilities */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">09.</span> Restaurant Responsibilities & Disclaimers
              </h2>
              <p>
                Restaurants retain exclusive and complete responsibility for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Accuracy and currency of dish names, descriptions, prices, portion sizes, and availability status.</li>
                <li>Clear and truthful disclosure of food allergens (including but not limited to peanuts, tree nuts, gluten, dairy, seafood, shellfish, eggs, and soy).</li>
                <li>Dietary claims (such as Halal, Vegetarian, Vegan, Organic, or Gluten-Free certifications).</li>
                <li>Compliance with Sri Lankan consumer protection laws, food safety standards, and public health ordinances.</li>
                <li>Fulfilling food orders, handling customer complaints, billing diners, and managing restaurant service.</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Menuzo expressly disclaims any liability for allergic reactions, illness, consumer disputes, price discrepancies, or food quality issues resulting from restaurant offerings.
              </p>
            </section>

            {/* 10. Acceptable Use & Prohibited Content */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">10.</span> Acceptable Use & Prohibited Content
              </h2>
              <p>
                You agree not to upload, publish, or transmit any content that:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Is fraudulent, deceptive, defamatory, obscene, pornographic, or harassing.</li>
                <li>Infringes on any third-party copyright, trademark, trade secret, or privacy right.</li>
                <li>Promotes illegal substances, unlawful gambling, or prohibited activities under Sri Lankan law.</li>
                <li>Attempts to bypass or circumvent plan limitations (e.g. attempting to list excess food items outside authorized limits).</li>
                <li>Introduces viruses, malicious code, scrapers, or scripts designed to impair platform infrastructure.</li>
              </ul>
            </section>

            {/* 11. Content Ownership & License */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">11.</span> Content Ownership & Licensing
              </h2>
              <p>
                <strong className="text-foreground">Your Content:</strong> The restaurant retains 100% intellectual property ownership of all logos, photographs, brand assets, and menu descriptions submitted to Menuzo.
              </p>
              <p>
                <strong className="text-foreground">License Granted to Menuzo:</strong> By submitting content to the Service, you grant Menuzo a worldwide, non-exclusive, royalty-free license to host, cache, display, format, and resize your content solely to provide and operate the digital menu service.
              </p>
              <p>
                <strong className="text-foreground">Promotional Use:</strong> Menuzo will not use your restaurant&apos;s name, logo, or menu imagery in external advertising, press releases, or promotional showcases without obtaining your prior written or electronic permission.
              </p>
            </section>

            {/* 12. Intellectual Property */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">12.</span> Platform Intellectual Property
              </h2>
              <p>
                All software code, database architecture, algorithms, interface designs, logos, themes, and branding associated with Menuzo are the exclusive intellectual property of the creators and developers of Menuzo, <strong className="text-foreground">Hasni Zihar</strong> and <strong className="text-foreground">Shazan</strong>.
              </p>
              <p>
                You are granted a limited, revocable, non-transferable, and non-exclusive license to access and use Menuzo in accordance with these Terms. You may not decompile, reverse-engineer, duplicate, resell, or exploit any portion of the platform code or design system without explicit written consent.
              </p>
            </section>

            {/* 13. Analytics & Privacy */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">13.</span> Analytics & Privacy Overview
              </h2>
              <p>
                Menuzo records basic aggregate metrics (such as daily menu visits and QR scans) to provide performance statistics to restaurant owners. Customers browse digital menus without signing in, and Menuzo does not track, store, or profile individual diner identities.
              </p>
              <p>
                All personal information provided by restaurant owners (such as email addresses and contact information) is collected and processed strictly in accordance with our <button type="button" onClick={() => handleTabChange('privacy')} className="text-primary hover:underline font-semibold inline">Privacy Policy</button>.
              </p>
            </section>

            {/* 14. Suspension & Termination */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">14.</span> Account Suspension & Termination
              </h2>
              <p>
                Menuzo reserves the right to suspend or terminate accounts that breach these Terms, upload prohibited material, or engage in fraudulent activities.
              </p>
              <p>
                Except in cases of severe illegal conduct, copyright infringement, or security hazards requiring immediate intervention, Menuzo will endeavor to issue an advance warning and provide a reasonable opportunity to rectify the violation. When an account is suspended or terminated, public access to its digital menu, custom URL, and QR code links is deactivated immediately.
              </p>
            </section>

            {/* 15. Account Transfers */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">15.</span> Account Transfers
              </h2>
              <p>
                If a restaurant changes ownership, management, or administrative personnel, the restaurant account may be transferred to a new verified Google account upon receipt of a written authorization request sent from the registered owner to <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline font-medium">menuzoapp@gmail.com</a>.
              </p>
            </section>

            {/* 16. Service Availability & Modifications */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">16.</span> Service Availability & Modifications
              </h2>
              <p>
                While Menuzo strives to maintain maximum uptime and high operational reliability, the Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Periodic scheduled maintenance, server updates, or telecommunications disruptions may occasionally cause brief downtime.
              </p>
              <p>
                We reserve the right to improve, update, or modify features of the platform. Material feature discontinuations will be notified in advance through your dashboard or email.
              </p>
            </section>

            {/* 17. Limitation of Liability */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">17.</span> Limitation of Liability
              </h2>
              <p>
                To the maximum extent permissible under applicable Sri Lankan law:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Menuzo and its operators shall not be liable for any indirect, incidental, special, punitive, or consequential damages, lost profits, revenue loss, or data disruption.</li>
                <li>Menuzo is not liable for inaccurate restaurant descriptions, food allergen reactions, or disputes between dining establishments and their guests.</li>
                <li>Menuzo&apos;s total aggregate liability arising under or relating to these Terms shall not exceed the total fees actually paid by the restaurant to Menuzo during the three (3) months preceding the incident, or LKR 10,000, whichever is less.</li>
                <li>Nothing in these Terms limits or excludes liability that cannot lawfully be limited under Sri Lankan consumer protection or common law.</li>
              </ul>
            </section>

            {/* 18. Changes to These Terms */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">18.</span> Changes to These Terms
              </h2>
              <p>
                We may revise these Terms from time to time. When material amendments occur, we will update the &ldquo;Last Updated&rdquo; date at the top of this document and post an alert inside the restaurant dashboard. Continued access or use of Menuzo after such modifications constitutes your agreement to the revised Terms.
              </p>
            </section>

            {/* 19. Governing Law & Jurisdiction */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">19.</span> Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms and all matters arising out of your relationship with Menuzo shall be governed by, interpreted, and construed exclusively in accordance with the substantive laws of the <strong className="text-foreground">Democratic Socialist Republic of Sri Lanka</strong>.
              </p>
              <p>
                Any dispute, claim, or controversy arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts of Sri Lanka.
              </p>
            </section>

            {/* 20. Contact Information */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">20.</span> Contact Information
              </h2>
              <p>
                If you have questions, feedback, refund requests, or notices regarding these Terms & Conditions, please contact us at:
              </p>
              <div className="flex items-center gap-2 pt-1 text-foreground font-medium">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline">menuzoapp@gmail.com</a>
              </div>
            </section>

          </div>
        ) : (
          /* ========================================================================= */
          /* PRIVACY POLICY CONTENT                                                    */
          /* ========================================================================= */
          <div className="space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
            
            {/* 1. Introduction & Scope */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">01.</span> Introduction & Scope
              </h2>
              <p>
                This Privacy Policy outlines how <strong className="text-foreground">Menuzo</strong> collects, processes, stores, and protects personal and technical data across our digital menu SaaS platform in Sri Lanka. Menuzo operates in adherence to core data protection principles including purpose limitation, data minimization, and accuracy, taking into consideration the Personal Data Protection Act No. 9 of 2022 of Sri Lanka (PDPA).
              </p>
              <p>
                This policy applies to all users of the platform, including restaurant owners, managers, staff, and public diners who view menus. For details regarding commercial rules and plan limitations, please review our <button type="button" onClick={() => handleTabChange('terms')} className="text-primary hover:underline font-semibold inline">Terms & Conditions</button>.
              </p>
            </section>

            {/* 2. Roles: Data Controller vs. Data Processor */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">02.</span> Roles: Data Controller vs. Data Processor
              </h2>
              <p>
                Under modern data protection frameworks:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong className="text-foreground">Menuzo as a Data Controller:</strong> Menuzo acts as the data controller for the registration, authentication, payment verification, and account management data of restaurant owners, staff, and administrators.
                </li>
                <li>
                  <strong className="text-foreground">Menuzo as a Data Processor:</strong> For restaurant menu content, dish descriptions, prices, and public profile listings published by the restaurant, the restaurant acts as the primary publisher and controller of its content, while Menuzo acts as the technological data processor hosting and serving that content.
                </li>
              </ul>
            </section>

            {/* 3. Information We Collect */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">03.</span> Information We Collect
              </h2>
              
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Restaurant Owners */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-primary" /> From Restaurant Owners & Staff:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li><strong className="text-foreground">Required Account Information:</strong> Google account email address, full name, and avatar URL provided automatically during Google OAuth sign-in.</li>
                    <li><strong className="text-foreground">Required Restaurant Profile:</strong> Restaurant business name, currency preference, and unique URL slug.</li>
                    <li><strong className="text-foreground">Optional Restaurant Information:</strong> Business address/location, contact telephone number, marketing tagline, description, custom branding colors, and logo/banner images.</li>
                    <li><strong className="text-foreground">Menu Items & Categories:</strong> Category names, item titles, descriptions, prices, discounted prices, portion sizes, dietary tags, and uploaded food photographs.</li>
                    <li><strong className="text-foreground">Payment Verification Data:</strong> Payer name, bank transaction reference number, optional customer note, and uploaded bank transfer confirmation slips submitted for manual verification.</li>
                  </ul>
                </div>

                {/* Customers & Diners */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-emerald-400" /> From Customers & Diners (Menu Viewers):
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li><strong className="text-foreground">Zero Account Requirement:</strong> Diners browse public menus without logging in, without registering, and without submitting personal names, phone numbers, or emails.</li>
                    <li><strong className="text-foreground">No Payment Card Collection:</strong> Menuzo does not process food orders or food payments from diners. We never request, collect, or store diner credit or debit card numbers.</li>
                    <li><strong className="text-foreground">No Personal Diner Profiling:</strong> We do not track diner browsing habits across other websites or construct individual customer profiles.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. Customer Browsing & Technical Identifiers */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">04.</span> Customer Browsing & Technical Tracking
              </h2>
              <p>
                When a diner scans a Menuzo QR code or loads a public menu link:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong className="text-foreground">Visit Incrementing:</strong> Menuzo executes an automated procedure (<code className="text-primary text-[11px] font-mono">increment_shop_visits</code>) that increments the total visit counter and notes whether the arrival was via a QR code or direct link.
                </li>
                <li>
                  <strong className="text-foreground">Session Deduplication:</strong> To avoid artificially inflating visit counters if a customer refreshes their browser, the diner&apos;s browser saves a temporary key (<code className="text-primary text-[11px] font-mono">tracked_visit_[shopId]_[isQr]</code>) in volatile <strong className="text-foreground">SessionStorage</strong>. This key expires automatically when the browser tab is closed.
                </li>
                <li>
                  <strong className="text-foreground">No Persistent User Tracking:</strong> Menuzo does not retain individual IP addresses, device serial numbers, or advertising identifiers in connection with customer menu visits.
                </li>
              </ul>
            </section>

            {/* 5. Cloud Service Providers & Data Processors */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">05.</span> Cloud Service Providers & Sub-Processors
              </h2>
              <p>
                Menuzo engages industry-standard cloud providers to host and secure the Service. The actual providers and their verified roles are:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Database className="w-4 h-4 text-emerald-400" /> Supabase
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Provides PostgreSQL database hosting, Row-Level Security (RLS), edge procedures, and user authentication infrastructure. Stores restaurant profiles, menu items, and payment requests.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Cloud className="w-4 h-4 text-blue-400" /> Cloudinary
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Provides cloud media storage and a global content delivery network (CDN) for uploaded restaurant logos, banner graphics, and food item photographs.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Lock className="w-4 h-4 text-red-400" /> Google Authentication (OAuth)
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Authenticates restaurant owners securely. Google confirms owner identity and transmits the owner&apos;s email and name without exposing user passwords to Menuzo.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Server className="w-4 h-4 text-primary" /> WhatsApp (Meta Platforms)
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Acts as the communication channel for restaurants to submit bank transfer receipts and payment verification requests directly to Menuzo administrators.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Cookies & Client-Side Storage */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">06.</span> Cookies & Local Storage Technologies
              </h2>
              <p>
                Menuzo avoids invasive advertising or cross-site tracking cookies. The client-side storage technologies actually employed by the application are strictly functional:
              </p>

              <div className="overflow-x-auto rounded-xl border border-border/80 my-3 text-xs sm:text-sm">
                <table className="w-full text-left">
                  <thead className="bg-muted/80 text-foreground font-semibold border-b border-border/80">
                    <tr>
                      <th className="py-2.5 px-3">Storage Key</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-2 px-3 font-mono text-primary text-xs">sidebar:state</td>
                      <td className="py-2 px-3">Cookie</td>
                      <td className="py-2 px-3 text-muted-foreground">Stores whether the restaurant admin sidebar is expanded or collapsed.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-primary text-xs">vite-ui-theme</td>
                      <td className="py-2 px-3">LocalStorage</td>
                      <td className="py-2 px-3 text-muted-foreground">Remembers user preference for Dark Mode or Light Mode across visits.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-primary text-xs">qr-progress</td>
                      <td className="py-2 px-3">LocalStorage</td>
                      <td className="py-2 px-3 text-muted-foreground">Caches in-progress QR customization steps during editing sessions.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-primary text-xs">tracked_visit_*</td>
                      <td className="py-2 px-3">SessionStorage</td>
                      <td className="py-2 px-3 text-muted-foreground">Prevents duplicate visit counter increments when a diner refreshes a menu tab.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-primary text-xs">menuzo_upgrade_intent</td>
                      <td className="py-2 px-3">SessionStorage</td>
                      <td className="py-2 px-3 text-muted-foreground">Preserves plan selection intent during the sign-in / redirect flow.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 7. How Information is Used */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">07.</span> How We Use Your Information
              </h2>
              <p>We process information strictly for legitimate operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong className="text-foreground">Providing the Service:</strong> Hosting digital menus, formatting layouts, generating downloadable QR codes, and routing custom URLs.</li>
                <li><strong className="text-foreground">Authentication & Security:</strong> Verifying Google logins, protecting owner dashboards, and isolating restaurant data via Row-Level Security.</li>
                <li><strong className="text-foreground">Subscription Management:</strong> Manually checking bank transfer slips and enabling Pro features for active subscribers.</li>
                <li><strong className="text-foreground">Owner Analytics:</strong> Displaying aggregated visit counts and QR scans to help owners gauge menu traffic.</li>
                <li><strong className="text-foreground">Customer Support:</strong> Addressing technical difficulties, menu updates, and billing inquiries submitted to <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline">menuzoapp@gmail.com</a>.</li>
              </ul>
              <p className="font-semibold text-foreground text-xs sm:text-sm pt-1">
                Menuzo does not sell, lease, license, or monetize your personal information or restaurant data to any third-party marketing brokers.
              </p>
            </section>

            {/* 8. Payments & Financial Data */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">08.</span> Payments & Financial Data Handling
              </h2>
              <p>
                Menuzo processes subscriptions via <strong className="text-foreground">manual bank transfer</strong>. Menuzo does <strong>NOT</strong> collect, process, or store credit card numbers, debit card details, CVVs, or online banking passwords.
              </p>
              <p>
                Payment confirmation slips and transaction reference numbers uploaded or transmitted via WhatsApp are reviewed solely by authorized administrators to confirm receipt of funds into Menuzo&apos;s nominated Sri Lankan bank account. Once verified, payment records are preserved in Supabase for audit, accounting, and dispute resolution purposes.
              </p>
            </section>

            {/* 9. Data Retention & Deletion */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">09.</span> Data Retention & Account Deletion
              </h2>
              <p>
                Restaurant owners retain full autonomy over their menu data and may edit or delete food items, categories, and photographs at any time directly through the dashboard.
              </p>
              <p>
                <strong className="text-foreground">Account Deletion:</strong> If you wish to permanently delete your restaurant profile and associated menu data, you may submit an account deletion request to <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline font-medium">menuzoapp@gmail.com</a>. Upon verification of ownership, your restaurant records, food items, and public menus will be permanently expunged from our active Supabase database within thirty (30) days.
              </p>
              <p className="text-xs text-muted-foreground">
                Note on Media Deletion: Media assets uploaded to Cloudinary are removed from public display upon deletion of corresponding menu records; permanent cache clearing may take up to several days across CDN edge nodes.
              </p>
            </section>

            {/* 10. Security Practices */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">10.</span> Security Practices
              </h2>
              <p>
                Menuzo implements reasonable administrative, organizational, and technical safeguards to protect data:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Enforced HTTPS/TLS cryptographic encryption for all web and API traffic.</li>
                <li>PostgreSQL Row-Level Security (RLS) policies ensuring each restaurant owner can access and modify only their own data.</li>
                <li>Delegated authentication via Google OAuth, eliminating the need to store passwords on Menuzo servers.</li>
                <li>Restricted administrative access limited strictly to platform founders.</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                While we implement robust security protocols, no internet transmission or digital storage system is 100% immune from compromise. We cannot guarantee absolute security against all unforeseen threats.
              </p>
            </section>

            {/* 11. User Rights & Choices */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">11.</span> User Rights & Choices
              </h2>
              <p>
                In accordance with applicable privacy standards and Part II of the Sri Lankan Personal Data Protection Act No. 9 of 2022:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong className="text-foreground">Right of Access:</strong> You may request a copy of the personal data held about you by Menuzo.</li>
                <li><strong className="text-foreground">Right to Rectification:</strong> You may update or correct inaccurate restaurant details and menu content directly via your dashboard at any time.</li>
                <li><strong className="text-foreground">Right to Erasure:</strong> You may request the permanent removal of your account and menu information by contacting us.</li>
                <li><strong className="text-foreground">Right to Object:</strong> You may object to the processing of non-essential communications or withdraw consent for discretionary promotional features.</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                To exercise any of these rights, please contact our administrative team at <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline">menuzoapp@gmail.com</a>. Requests are acknowledged and processed within reasonable statutory timeframes.
              </p>
            </section>

            {/* 12. Children's Privacy */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">12.</span> Children&apos;s Privacy
              </h2>
              <p>
                Menuzo is a business software service designed for restaurant managers and commercial food establishments. It is not intended for or directed toward children under 13 years of age. We do not knowingly collect personal information from minors.
              </p>
            </section>

            {/* 13. International Data Transfers */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">13.</span> International Data Transfers
              </h2>
              <p>
                Menuzo operates out of Sri Lanka. However, our technical cloud service providers—including Supabase (database), Cloudinary (CDN), and Google (authentication)—maintain secure server infrastructure in regions outside Sri Lanka (such as the United States, Europe, and Singapore).
              </p>
              <p>
                By using Menuzo, restaurant owners understand and acknowledge that their submitted menu and account information will be transmitted to, processed, and stored on these global cloud servers in accordance with the providers&apos; respective enterprise security standards.
              </p>
            </section>

            {/* 14. Changes to This Privacy Policy */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">14.</span> Changes to This Privacy Policy
              </h2>
              <p>
                We may periodically update this Privacy Policy to reflect technical enhancements, cloud provider updates, or statutory adjustments under Sri Lankan law. Material changes will be accompanied by an updated effective date and a notice posted within the restaurant dashboard. Continued use of Menuzo after the publication of an updated policy signifies your acceptance of the changes.
              </p>
            </section>

            {/* 15. Privacy Contact */}
            <section className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="text-primary font-mono text-lg">15.</span> Contact Privacy Officer
              </h2>
              <p>
                For questions, concerns, data access requests, or privacy inquiries under this Privacy Policy, please email our administrative team at:
              </p>
              <div className="flex items-center gap-2 pt-1 text-foreground font-medium">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline">menuzoapp@gmail.com</a>
              </div>
            </section>

          </div>
        )}

        {/* Bottom Back Button */}
        <div className="mt-14 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Button>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Questions regarding our policies? Email <a href="mailto:menuzoapp@gmail.com" className="text-primary hover:underline">menuzoapp@gmail.com</a>
          </p>
        </div>

      </main>
    </div>
  );
}
