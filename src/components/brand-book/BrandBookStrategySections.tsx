import { Section, Subsection, Copyable, BrandCard, TagChip, Callout } from './BrandBookPrimitives';
import * as overview from '@/content/brand-book/overview';
import * as identity from '@/content/brand-book/identity';
import * as values from '@/content/brand-book/values';
import * as voice from '@/content/brand-book/voice';
import { motion } from 'framer-motion';

const { brandFoundation, taglineAlternatives, elevatorPitch } = overview;
const { brandPersonality, targetAudience, customerPersona } = identity;
const { brandValues } = values;
const { brandVoice, voiceExamples, messagingFramework } = voice;

// ── Hero ─────────────────────────────────────────────────

export function BrandBookHero() {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0, 0, 0.2, 1] }}
        className="relative"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-12 bg-primary/40" />
          <span className="text-xs font-mono text-primary uppercase tracking-[0.2em]">Brand Identity System</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
          MENUZO
          <br />
          <span className="text-primary">Brand Book</span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
          The complete identity system for Menuzo. A single source of truth for designers, developers, marketers, and partners.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium border border-green-500/20">
            ● Active
          </span>
          <span className="text-xs text-muted-foreground font-mono">v1.0</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Last updated July 2026</span>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {['Download PDF', 'Figma Assets', 'Brand Assets'].map((label) => (
            <button
              key={label}
              disabled
              className="px-4 py-2 text-xs font-medium rounded-lg border border-border/60 text-muted-foreground/50 bg-muted/20 cursor-not-allowed"
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ── Introduction ─────────────────────────────────────────

export function IntroductionSection() {
  return (
    <Section id="introduction" title="Introduction" subtitle="Why this document exists">
      <Callout type="important">
        <p>{brandFoundation.purpose}</p>
      </Callout>
    </Section>
  );
}

// ── Brand DNA ────────────────────────────────────────────

export function BrandDNASection() {
  return (
    <Section id="brand-dna" title="Brand DNA" subtitle="The strategic foundation that drives every decision">
      <Subsection id="mission" title="Mission">
        <Copyable label="Mission" value={brandFoundation.mission} large />
      </Subsection>

      <Subsection id="vision" title="Vision">
        <Copyable label="Vision" value={brandFoundation.vision} large />
      </Subsection>

      <Subsection id="purpose" title="Purpose">
        <Copyable label="Purpose" value={brandFoundation.purposeStatement} />
      </Subsection>

      <Subsection id="tagline" title="Tagline">
        <Copyable label="Primary Tagline" value={brandFoundation.tagline} large />
        <div className="mt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Alternatives</p>
          <div className="flex flex-wrap gap-2">
            {taglineAlternatives.map((t) => (
              <TagChip key={t} label={t} />
            ))}
          </div>
        </div>
      </Subsection>

      <Subsection id="brand-promise" title="Brand Promise">
        <Copyable label="Brand Promise" value={brandFoundation.brandPromise} />
      </Subsection>
    </Section>
  );
}

// ── Identity ─────────────────────────────────────────────

export function IdentitySection() {
  return (
    <Section id="identity" title="Identity" subtitle="Who we are and who we serve">
      <Subsection id="personality" title="Personality">
        <p className="text-sm text-muted-foreground mb-4">Describe Menuzo like a human.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {brandPersonality.traits.map((t) => (
            <TagChip key={t} label={t} variant="success" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Avoid</p>
        <div className="flex flex-wrap gap-2">
          {brandPersonality.avoid.map((t) => (
            <TagChip key={t} label={t} variant="avoid" />
          ))}
        </div>
      </Subsection>

      <Subsection id="values" title="Values">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandValues.map((v) => (
            <BrandCard key={v.title} icon={v.icon} title={v.title} description={v.description} />
          ))}
        </div>
      </Subsection>

      <Subsection id="audience" title="Target Audience">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Primary</p>
            <div className="space-y-2">
              {targetAudience.primary.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {a}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Secondary</p>
            <div className="space-y-2">
              {targetAudience.secondary.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Subsection>

      <Subsection id="persona" title="Customer Persona">
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">👤</div>
            <div>
              <h4 className="font-semibold text-foreground">{customerPersona.title}</h4>
              <p className="text-sm text-muted-foreground">Age: {customerPersona.age}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-destructive/80 uppercase tracking-wider mb-2 font-medium">Pain Points</p>
              <ul className="space-y-1.5">
                {customerPersona.problems.map((p) => (
                  <li key={p} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive/60 mt-0.5">✕</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 font-medium">Goals</p>
              <ul className="space-y-1.5">
                {customerPersona.goals.map((g) => (
                  <li key={g} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Subsection>

      <Subsection id="positioning" title="Positioning">
        <Copyable label="Positioning Statement" value={brandFoundation.positioning} />
      </Subsection>

      <Subsection id="usp" title="Unique Selling Proposition">
        <Copyable label="USP" value={brandFoundation.usp} />
      </Subsection>
    </Section>
  );
}

// ── Voice & Tone ─────────────────────────────────────────

export function VoiceSection() {
  return (
    <Section id="voice" title="Voice & Tone" subtitle="How Menuzo speaks to the world">
      <Subsection id="tone" title="Tone">
        <div className="flex flex-wrap gap-2 mb-5">
          {brandVoice.toneWords.map((w) => (
            <TagChip key={w} label={w} variant="success" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Writing Style</p>
        <div className="flex flex-wrap gap-2">
          {brandVoice.writingStyle.map((w) => (
            <TagChip key={w} label={w} />
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Examples</p>
          {voiceExamples.map((ex) => (
            <div key={ex.context} className="bg-card border border-border/60 rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">{ex.context}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                  <span className="text-green-500 text-xs mt-0.5">✓</span>
                  <p className="text-sm text-foreground">{ex.doSay}</p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                  <span className="text-destructive text-xs mt-0.5">✕</span>
                  <p className="text-sm text-muted-foreground">{ex.dontSay}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection id="messaging" title="Messaging Framework">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(messagingFramework).map(([key, val], i) => (
            <div key={key} className="bg-card border border-border/60 rounded-xl p-4 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-6xl font-bold text-muted/10 leading-none">{i + 1}</span>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2 relative z-10">{key}</p>
              <p className="text-sm text-foreground relative z-10">{val}</p>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection id="elevator-pitch" title="Elevator Pitch">
        <div className="space-y-4">
          <Copyable label="One Sentence" value={elevatorPitch.oneSentence} />
          <Copyable label="30-Second Pitch" value={elevatorPitch.thirtySeconds} />
          <Copyable label="60-Second Pitch" value={elevatorPitch.sixtySeconds} />
        </div>
      </Subsection>
    </Section>
  );
}
