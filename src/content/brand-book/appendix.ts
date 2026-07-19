import type { TimelineItem, DownloadAsset } from './types';

export const versionHistory: TimelineItem[] = [
  { version: '1.0', title: 'Brand Launch', date: 'July 2026', status: 'current' },
  { version: '1.1', title: 'Typography & Motion Refinement', date: 'Q4 2026', status: 'planned' },
  { version: '2.0', title: 'Complete Design System', date: '2027', status: 'planned' },
];

export const futureVision = `How the Menuzo identity should evolve over the next five years while remaining recognizable. 
The brand will grow alongside the product — from a single QR menu tool to a comprehensive 
restaurant technology platform — while maintaining the core values of simplicity, speed, and trust.`;

export const assetDownloads: DownloadAsset[] = [
  { title: 'Logos & Marks', format: 'SVG, PNG', size: '2.4 MB', placeholderType: 'download' },
  { title: 'Brand Typography', format: 'OTF, TTF', size: '1.8 MB', placeholderType: 'download' },
  { title: 'Color Swatches', format: 'ASE, CSS', size: '12 KB', placeholderType: 'download' },
  { title: 'Icon Library', format: 'SVG, Figma', size: '4.1 MB', placeholderType: 'download' },
  { title: 'Social Templates', format: 'Figma', size: '15.2 MB', placeholderType: 'download' },
  { title: 'QR Code Templates', format: 'PDF, Figma', size: '8.5 MB', placeholderType: 'download' },
];
