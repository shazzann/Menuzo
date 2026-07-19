import type { NavigationItem } from './types';
import * as overview from './overview';
import * as identity from './identity';
import * as voice from './voice';
import * as values from './values';
import * as colors from './colors';
import * as typography from './typography';
import * as logo from './logo';
import * as photography from './photography';
import * as ui from './ui';
import * as marketing from './marketing';
import * as applications from './applications';
import * as accessibility from './accessibility';
import * as appendix from './appendix';

export const brandBookSections: NavigationItem[] = [
  { id: 'introduction', title: 'Introduction', keywords: ['about', 'purpose', 'overview'] },
  {
    id: 'brand-dna', title: 'Brand DNA', keywords: ['core', 'foundation', 'strategy'], subsections: [
      { id: 'mission', title: 'Mission', keywords: ['goal', 'purpose', 'why'] },
      { id: 'vision', title: 'Vision', keywords: ['future', 'direction'] },
      { id: 'purpose', title: 'Purpose', keywords: ['reason', 'existence'] },
      { id: 'tagline', title: 'Tagline', keywords: ['slogan', 'catchphrase', 'motto'] },
      { id: 'brand-promise', title: 'Brand Promise', keywords: ['commitment', 'guarantee'] },
    ],
  },
  {
    id: 'identity', title: 'Identity', keywords: ['who we are', 'persona', 'traits'], subsections: [
      { id: 'personality', title: 'Personality', keywords: ['traits', 'character', 'attributes'] },
      { id: 'values', title: 'Values', keywords: ['principles', 'beliefs', 'core'] },
      { id: 'audience', title: 'Target Audience', keywords: ['customers', 'users', 'demographic'] },
      { id: 'persona', title: 'Customer Persona', keywords: ['profile', 'user', 'buyer'] },
      { id: 'positioning', title: 'Positioning', keywords: ['market', 'stance', 'differentiator'] },
      { id: 'usp', title: 'USP', keywords: ['unique selling proposition', 'advantage', 'edge'] },
    ],
  },
  {
    id: 'voice', title: 'Voice & Tone', keywords: ['writing', 'copywriting', 'communication'], subsections: [
      { id: 'tone', title: 'Tone', keywords: ['style', 'attitude', 'feeling'] },
      { id: 'messaging', title: 'Messaging', keywords: ['framework', 'narrative', 'story'] },
      { id: 'elevator-pitch', title: 'Elevator Pitch', keywords: ['summary', 'blurb', 'intro'] },
    ],
  },
  {
    id: 'visual-language', title: 'Visual Language', keywords: ['design', 'aesthetics', 'look'], subsections: [
      { id: 'logo', title: 'Logo', keywords: ['mark', 'brandmark', 'symbol'] },
      { id: 'colors', title: 'Color Palette', keywords: ['swatches', 'hex', 'rgb', 'primary'] },
      { id: 'typography', title: 'Typography', keywords: ['fonts', 'text', 'type', 'headings'] },
      { id: 'design-tokens', title: 'Design Tokens', keywords: ['variables', 'css', 'tailwind'] },
      { id: 'iconography', title: 'Iconography', keywords: ['icons', 'symbols', 'lucide'] },
      { id: 'photography', title: 'Photography', keywords: ['images', 'pictures', 'photos', 'style'] },
      { id: 'illustration', title: 'Illustration', keywords: ['drawings', 'art', 'graphics'] },
    ],
  },
  {
    id: 'components', title: 'Components', keywords: ['ui', 'elements', 'patterns', 'react'], subsections: [
      { id: 'buttons', title: 'Buttons', keywords: ['cta', 'actions', 'clicks'] },
      { id: 'ui-patterns', title: 'UI Patterns', keywords: ['cards', 'inputs', 'forms', 'badges'] },
      { id: 'design-principles', title: 'Design Principles', keywords: ['rules', 'guidelines', 'ux'] },
      { id: 'motion', title: 'Motion', keywords: ['animation', 'transitions', 'easing'] },
    ],
  },
  {
    id: 'applications', title: 'Applications', keywords: ['usage', 'examples', 'mockups'], subsections: [
      { id: 'brand-applications', title: 'Brand Applications', keywords: ['touchpoints', 'assets'] },
      { id: 'social-media', title: 'Social Media', keywords: ['instagram', 'facebook', 'twitter', 'linkedin'] },
      { id: 'marketing', title: 'Marketing', keywords: ['ads', 'campaigns', 'landing pages'] },
    ],
  },
  {
    id: 'resources', title: 'Resources', keywords: ['downloads', 'assets', 'help'], subsections: [
      { id: 'asset-downloads', title: 'Asset Downloads', keywords: ['files', 'svg', 'png', 'fonts', 'templates'] },
      { id: 'dos-and-donts', title: "Do's & Don'ts", keywords: ['rules', 'mistakes', 'avoid', 'guidelines'] },
      { id: 'accessibility', title: 'Accessibility', keywords: ['a11y', 'contrast', 'wcag', 'inclusive'] },
      { id: 'future-vision', title: 'Future Vision', keywords: ['roadmap', 'evolution', 'tomorrow'] },
      { id: 'version-history', title: 'Version History', keywords: ['changelog', 'updates', 'releases'] },
    ],
  },
];

export const content = {
  overview,
  identity,
  voice,
  values,
  colors,
  typography,
  logo,
  photography,
  ui,
  marketing,
  applications,
  accessibility,
  appendix
};
