export const iconography = {
  library: 'Lucide React',
  style: 'Outlined',
  strokeWidth: '1.5–2px',
  cornerRadius: 'Rounded',
  sizes: ['16px (inline)', '20px (default)', '24px (prominent)', '32px (feature)'],
  guidelines: [
    'Use outlined icons — not filled — for consistency with the minimal aesthetic.',
    'Maintain 1.5–2px stroke width across all icons.',
    'Use rounded line caps and joins.',
    'Icons should be optically centered within their bounding box.',
  ],
};

export const designPrinciples = [
  { title: 'Minimal', description: 'Remove everything that isn\'t essential. Every element must earn its place.', icon: '◻️' },
  { title: 'Whitespace', description: 'Generous spacing creates calm and directs focus to the content.', icon: '🌊' },
  { title: 'Readable', description: 'Typography is the foundation. Readability is never sacrificed for aesthetics.', icon: '📖' },
  { title: 'Accessible', description: 'WCAG AA compliant. Clear contrast, large touch targets, keyboard-navigable.', icon: '♿' },
  { title: 'Fast', description: 'Performance is a feature. The UI should feel instant.', icon: '⚡' },
  { title: 'Responsive', description: 'Every layout adapts seamlessly across devices.', icon: '📱' },
  { title: 'Consistent', description: 'One pattern, used everywhere. Consistency builds trust.', icon: '🎯' },
];

export const motionGuidelines = {
  principles: [
    'Animations should be subtle and purposeful',
    'No large parallax effects',
    'Respect prefers-reduced-motion',
    '200–300ms transitions',
    'Stagger animations only where they improve readability',
  ],
  speeds: [
    { name: 'Micro', duration: '100–150ms', usage: 'Hover states, focus rings, toggles' },
    { name: 'Standard', duration: '200–300ms', usage: 'Page transitions, card reveals, modals' },
    { name: 'Emphasis', duration: '400–500ms', usage: 'Hero animations, onboarding, first impressions' },
  ],
  easings: [
    { name: 'ease-out', css: 'cubic-bezier(0, 0, 0.2, 1)', usage: 'Enter animations' },
    { name: 'ease-in', css: 'cubic-bezier(0.4, 0, 1, 1)', usage: 'Exit animations' },
    { name: 'ease-in-out', css: 'cubic-bezier(0.4, 0, 0.2, 1)', usage: 'Move / resize' },
  ],
};
