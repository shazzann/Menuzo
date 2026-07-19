import { Section, Subsection, Placeholder } from './BrandBookPrimitives';
import * as applications from '@/content/brand-book/applications';
import * as marketing from '@/content/brand-book/marketing';
import * as accessibility from '@/content/brand-book/accessibility';
import * as appendix from '@/content/brand-book/appendix';

const { brandApplications } = applications;
const { socialMediaChannels, dosAndDonts } = marketing;
const { accessibilityChecklist } = accessibility;
const { versionHistory, futureVision, assetDownloads } = appendix;
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

// ── Applications ─────────────────────────────────────────

export function ApplicationsSection() {
  return (
    <Section id="applications" title="Applications" subtitle="How the Menuzo brand comes to life across touchpoints">
      <Subsection id="brand-applications" title="Brand Applications">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brandApplications.map((app) => (
            <div key={app.title} className="bg-card border border-border/60 rounded-xl p-4 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
              {app.status === 'coming-soon' && (
                <span className="absolute top-2 right-2 text-[9px] font-medium text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">Soon</span>
              )}
              <span className="text-2xl block mb-2">{app.icon}</span>
              <p className="text-sm font-medium text-foreground">{app.title}</p>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection id="social-media" title="Social Media">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {socialMediaChannels.map((ch) => (
            <div key={ch.name} className="bg-card border border-border/60 rounded-xl p-4 relative">
              <p className="text-sm font-semibold text-foreground">{ch.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">{ch.handle}</p>
              <span className="absolute top-3 right-3 text-[9px] font-medium text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">Coming Soon</span>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection id="marketing" title="Marketing">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['Landing Pages', 'Ads', 'Email Templates', 'Blog', 'Banners', 'Presentations'].map((label) => (
            <Placeholder key={label} label={label} height="h-28" />
          ))}
        </div>
      </Subsection>
    </Section>
  );
}

// ── Resources ────────────────────────────────────────────

export function ResourcesSection() {
  return (
    <Section id="resources" title="Resources" subtitle="Guidelines, accessibility, and version history">
      {/* Asset Downloads */}
      <Subsection id="asset-downloads" title="Asset Downloads">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {assetDownloads.map((asset) => (
            <div key={asset.title} className="bg-card border border-border/60 rounded-xl p-4 flex items-center justify-between group transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
              <div>
                <p className="text-sm font-semibold text-foreground">{asset.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{asset.format}</span>
                  <span className="text-xs text-muted-foreground/60">{asset.size}</span>
                </div>
              </div>
              <button disabled className="w-8 h-8 rounded-full bg-muted/30 text-muted-foreground/50 flex items-center justify-center cursor-not-allowed group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                ↓
              </button>
            </div>
          ))}
        </div>
      </Subsection>
      {/* Do's and Don'ts */}
      <Subsection id="dos-and-donts" title="Do's & Don'ts">
        <div className="space-y-6">
          {Object.entries(dosAndDonts).map(([category, { dos, donts }]) => (
            <div key={category} className="bg-card border border-border/60 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-foreground capitalize mb-4">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {dos.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                      <span className="text-foreground">{d}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {donts.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive/70 shrink-0 mt-0.5">✕</span>
                      <span className="text-muted-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Subsection>

      {/* Accessibility */}
      <Subsection id="accessibility" title="Accessibility">
        <div className="space-y-3">
          {accessibilityChecklist.map((item) => {
            const StatusIcon = item.status === 'implemented' ? CheckCircle2 : item.status === 'in-progress' ? Clock : AlertCircle;
            const statusColors = {
              implemented: 'text-green-500',
              'in-progress': 'text-amber-500',
              planned: 'text-muted-foreground/40',
            };
            const statusLabels = {
              implemented: 'Implemented',
              'in-progress': 'In Progress',
              planned: 'Planned',
            };

            return (
              <div key={item.title} className="bg-card border border-border/60 rounded-xl p-4 flex items-start gap-4">
                <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${statusColors[item.status]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      item.status === 'implemented' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                      item.status === 'in-progress' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-muted/30 text-muted-foreground/60'
                    }`}>{statusLabels[item.status]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Subsection>

      {/* Future Vision */}
      <Subsection id="future-vision" title="Future Vision">
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {futureVision}
          </p>
          <div className="mt-5 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-primary font-medium">This section will be expanded as the Menuzo brand evolves.</p>
          </div>
        </div>
      </Subsection>

      {/* Version History Timeline */}
      <Subsection id="version-history" title="Version History">
        <div className="relative pl-6 border-l-2 border-border/60 space-y-8">
          {versionHistory.map((entry) => (
            <div key={entry.version} className="relative">
              <div className={`absolute -left-[calc(1.5rem+5px)] w-3 h-3 rounded-full border-2 ${
                entry.status === 'current' ? 'bg-primary border-primary' :
                entry.status === 'released' ? 'bg-green-500 border-green-500' :
                'bg-background border-border'
              }`} />
              <div className="bg-card border border-border/60 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono font-semibold text-primary">v{entry.version}</span>
                  {entry.status === 'current' && (
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Current</span>
                  )}
                  {entry.status === 'planned' && (
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground/60">Planned</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Subsection>
    </Section>
  );
}
