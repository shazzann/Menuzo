import type { AccessibilityItem } from './types';

export const accessibilityChecklist: AccessibilityItem[] = [
  { title: 'Color Contrast', description: 'All text meets WCAG AA 4.5:1 ratio for normal text, 3:1 for large text.', status: 'implemented' },
  { title: 'Font Sizes', description: 'Base font 16px minimum. No text smaller than 12px.', status: 'implemented' },
  { title: 'Touch Targets', description: 'Interactive elements minimum 44×44px.', status: 'implemented' },
  { title: 'Keyboard Navigation', description: 'All interactive elements are focusable and operable via keyboard.', status: 'in-progress' },
  { title: 'Screen Readers', description: 'ARIA labels on all icons, images, and interactive controls.', status: 'in-progress' },
  { title: 'Reduced Motion', description: 'Respects prefers-reduced-motion for all animations.', status: 'planned' },
  { title: 'Semantic Headings', description: 'Proper heading hierarchy without skipping levels (H1 -> H2 -> H3).', status: 'implemented' },
  { title: 'Visible Focus States', description: 'Clear focus rings around interactive elements when using keyboard.', status: 'implemented' },
];
