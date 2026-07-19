import { Section, Subsection, ColorSwatch, Placeholder, CodeBlock, BrandCard, Callout } from './BrandBookPrimitives';
import { Home, Search, Settings, User, Menu, Star, Heart, ShoppingCart, Eye, QrCode, ChefHat, UtensilsCrossed, Palette, BarChart3, Bell, Shield } from 'lucide-react';
import * as colors from '@/content/brand-book/colors';
import * as typography from '@/content/brand-book/typography';
import * as logo from '@/content/brand-book/logo';
import * as ui from '@/content/brand-book/ui';
import * as photography from '@/content/brand-book/photography';

const { brandColors, cssVariablesLight, cssVariablesDark, tailwindTokens } = colors;
const { typographyScale } = typography;
const { logos, logoGuidelines } = logo;
const { iconography, designPrinciples, motionGuidelines } = ui;
const { photographyStyle, illustrationStyle, photographyGallery } = photography;

// ── Visual Language ──────────────────────────────────────

export function VisualLanguageSection() {
  return (
    <Section id="visual-language" title="Visual Language" subtitle="The design system that defines Menuzo's visual identity">
      {/* Logo */}
      <Subsection id="logo" title="Logo">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {logos.map((l) => (
            <Placeholder key={l.name} label={l.name} height="h-28" lightbox={true} imagePath={l.imagePath} description={l.description} type={l.placeholderType as any} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {logoGuidelines.map((guide) => (
            <Placeholder key={guide.title} label={guide.title} height="h-24" description={guide.description} type={guide.placeholderType as any} />
          ))}
        </div>
      </Subsection>

      {/* Colors */}
      <Subsection id="colors" title="Color Palette">
        <Callout type="tip">
          <p>Hover over any swatch to see detailed color values. Click to copy the HEX code to your clipboard.</p>
        </Callout>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {brandColors.map((c) => (
            <ColorSwatch key={c.token} name={c.name} hex={c.hex} rgb={c.rgb} hsl={c.hsl} usage={c.usage} cssVar={c.cssVariable} />
          ))}
        </div>
      </Subsection>

      {/* Typography */}
      <Subsection id="typography" title="Typography">
        <div className="space-y-3 mb-8">
          {typographyScale.map((t) => (
            <div key={t.level} className="bg-card border border-border/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: t.family, fontSize: t.level === 'Display' ? '2rem' : undefined, fontWeight: t.weight }}
                   className={`text-foreground leading-tight truncate ${t.level === 'Display' ? '' : t.level.startsWith('H') ? 'text-xl' : 'text-base'}`}>
                  {t.level === 'Code' ? (
                    <code className="font-mono">The quick brown fox</code>
                  ) : (
                    'The quick brown fox jumps over the lazy dog'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground font-mono">
                <span className="bg-muted/30 px-2 py-0.5 rounded">{t.level}</span>
                <span>{t.family}</span>
                <span>{t.size}</span>
                <span className="hidden sm:inline">w{t.weight}</span>
              </div>
            </div>
          ))}
        </div>
      </Subsection>

      {/* Design Tokens */}
      <Subsection id="design-tokens" title="Design Tokens">
        <p className="text-sm text-muted-foreground mb-5">Implementation-ready CSS variables and Tailwind tokens.</p>
        <div className="space-y-4">
          <CodeBlock code={cssVariablesLight} language="css" />
          <CodeBlock code={cssVariablesDark} language="css" />
          <CodeBlock code={tailwindTokens} language="javascript" />
        </div>
      </Subsection>

      {/* Iconography */}
      <Subsection id="iconography" title="Iconography">
        <div className="bg-card border border-border/60 rounded-xl p-5 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Library</p>
              <p className="text-sm text-foreground font-medium">{iconography.library}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Style</p>
              <p className="text-sm text-foreground font-medium">{iconography.style}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Stroke</p>
              <p className="text-sm text-foreground font-medium">{iconography.strokeWidth}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Corners</p>
              <p className="text-sm text-foreground font-medium">{iconography.cornerRadius}</p>
            </div>
          </div>
          <div className="space-y-2">
            {iconography.guidelines.map((g, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span> {g}
              </div>
            ))}
          </div>
        </div>
        {/* Live icon grid */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Icon Samples</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {[
            { Icon: Home, name: 'Home' }, { Icon: Search, name: 'Search' }, { Icon: Settings, name: 'Settings' },
            { Icon: User, name: 'User' }, { Icon: Menu, name: 'Menu' }, { Icon: Star, name: 'Star' },
            { Icon: Heart, name: 'Heart' }, { Icon: ShoppingCart, name: 'Cart' }, { Icon: Eye, name: 'Eye' },
            { Icon: QrCode, name: 'QR Code' }, { Icon: ChefHat, name: 'Chef' }, { Icon: UtensilsCrossed, name: 'Utensils' },
            { Icon: Palette, name: 'Palette' }, { Icon: BarChart3, name: 'Analytics' }, { Icon: Bell, name: 'Bell' },
            { Icon: Shield, name: 'Shield' },
          ].map(({ Icon, name }) => (
            <div key={name} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default">
              <Icon className="w-5 h-5 text-foreground" strokeWidth={1.75} />
              <span className="text-[9px] text-muted-foreground/70 font-medium text-center leading-tight">{name}</span>
            </div>
          ))}
        </div>
      </Subsection>

      {/* Photography */}
      <Subsection id="photography" title="Photography Style">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider mb-3 font-medium">Do</p>
            <div className="space-y-2">
              {photographyStyle.traits.map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-green-500">✓</span> {t}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-destructive/80 uppercase tracking-wider mb-3 font-medium">Avoid</p>
            <div className="space-y-2">
              {photographyStyle.avoid.map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive/60">✕</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {photographyGallery.map((img) => (
            <Placeholder key={img.title} label={img.title} height="h-32" lightbox={true} imagePath={img.imagePath} type={img.placeholderType as any} />
          ))}
        </div>
      </Subsection>

      {/* Illustration */}
      <Subsection id="illustration" title="Illustration Style">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Style</p>
            <div className="flex flex-wrap gap-2">
              {illustrationStyle.traits.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/20">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Subjects</p>
            <div className="flex flex-wrap gap-2">
              {illustrationStyle.subjects.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground border border-border/60">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </Subsection>
    </Section>
  );
}

// ── Components ───────────────────────────────────────────

export function ComponentsSection() {
  return (
    <Section id="components" title="Components" subtitle="UI patterns and interactive elements">
      <Subsection id="buttons" title="Buttons">
        <div className="bg-card border border-border/60 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            <button className="px-5 py-2.5 rounded-[14px] text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Primary</button>
            <button className="px-5 py-2.5 rounded-[14px] text-sm font-semibold bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-all">Secondary</button>
            <button className="px-5 py-2.5 rounded-[14px] text-sm font-semibold text-foreground hover:bg-muted/50 transition-all">Ghost</button>
            <button className="px-5 py-2.5 rounded-[14px] text-sm font-semibold border border-border text-foreground hover:bg-muted/30 transition-all">Outline</button>
            <button className="px-5 py-2.5 rounded-[14px] text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all">Destructive</button>
            <button disabled className="px-5 py-2.5 rounded-[14px] text-sm font-semibold bg-muted text-muted-foreground cursor-not-allowed opacity-50">Disabled</button>
          </div>
          <Callout type="best-practice">
            <p>Primary buttons use the brand orange with white text. Never place more than one primary button per view.</p>
          </Callout>
        </div>
      </Subsection>

      <Subsection id="ui-patterns" title="UI Patterns">
        <div className="space-y-6">
          {/* Live Card */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Card</p>
            <div className="bg-card border border-border/60 rounded-xl p-5 max-w-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="w-full h-28 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 mb-4 flex items-center justify-center text-3xl">🍜</div>
              <h4 className="font-semibold text-foreground">Pad Thai</h4>
              <p className="text-sm text-muted-foreground mt-1">Stir-fried rice noodles with shrimp, peanuts, and lime.</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-primary font-bold">$12.50</span>
                <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">Available</span>
              </div>
            </div>
          </div>
          {/* Live Inputs */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Inputs</p>
            <div className="flex flex-wrap gap-3 max-w-md">
              <input type="text" placeholder="Default input" className="flex-1 min-w-[160px] px-4 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40" readOnly />
              <input type="text" value="Focused state" className="flex-1 min-w-[160px] px-4 py-2.5 text-sm rounded-xl border-2 border-primary bg-background text-foreground ring-2 ring-primary/20 focus:outline-none" readOnly />
            </div>
          </div>
          {/* Live Badges */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Badges</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Pro</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">Active</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">Pending</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">Expired</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">Draft</span>
            </div>
          </div>
          {/* Loading Skeleton */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Loading Skeleton</p>
            <div className="bg-card border border-border/60 rounded-xl p-5 max-w-sm space-y-3 animate-pulse">
              <div className="w-full h-24 rounded-lg bg-muted/40" />
              <div className="h-4 w-3/4 rounded bg-muted/40" />
              <div className="h-3 w-1/2 rounded bg-muted/30" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-4 w-16 rounded bg-muted/40" />
                <div className="h-5 w-20 rounded-full bg-muted/30" />
              </div>
            </div>
          </div>
          {/* Remaining placeholders */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">More Patterns</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Tables', 'Navigation', 'Modals', 'Dropdowns', 'Forms', 'Empty States', 'Charts'].map((label) => (
                <Placeholder key={label} label={label} height="h-24" />
              ))}
            </div>
          </div>
        </div>
      </Subsection>

      <Subsection id="design-principles" title="Design Principles">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {designPrinciples.map((p) => (
            <BrandCard key={p.title} icon={p.icon} title={p.title} description={p.description} />
          ))}
        </div>
      </Subsection>

      <Subsection id="motion" title="Motion">
        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Principles</p>
            <div className="space-y-2">
              {motionGuidelines.principles.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">•</span> {p}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {motionGuidelines.speeds.map((s) => (
              <div key={s.name} className="bg-card border border-border/60 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <p className="text-xs font-mono text-primary mt-1">{s.duration}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.usage}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {motionGuidelines.easings.map((e) => (
              <div key={e.name} className="bg-card border border-border/60 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground">{e.name}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">{e.css}</p>
                <p className="text-xs text-muted-foreground mt-1">{e.usage}</p>
              </div>
            ))}
          </div>
        </div>
      </Subsection>
    </Section>
  );
}
