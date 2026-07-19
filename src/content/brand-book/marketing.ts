export const socialMediaChannels = [
  { name: 'Instagram', handle: '@menuzo', status: 'coming-soon' as const },
  { name: 'Facebook', handle: 'Menuzo', status: 'coming-soon' as const },
  { name: 'LinkedIn', handle: 'Menuzo', status: 'coming-soon' as const },
  { name: 'X (Twitter)', handle: '@menuzo', status: 'coming-soon' as const },
];

export const dosAndDonts = {
  logo: {
    dos: ['Use the official logo files provided', 'Maintain the clear space around the logo', 'Use the dark variant on light backgrounds'],
    donts: ['Stretch or distort the logo', 'Change the logo colors', 'Place the logo on busy backgrounds', 'Recreate or modify the logo'],
  },
  typography: {
    dos: ['Use Space Grotesk for headings', 'Use Inter for body text', 'Maintain the type scale'],
    donts: ['Use system fonts for headings', 'Mix more than two typefaces', 'Use fonts smaller than 12px'],
  },
  colors: {
    dos: ['Use the primary orange for CTAs and brand accents', 'Use the defined neutral scale for text', 'Ensure WCAG AA contrast ratios'],
    donts: ['Use pure black (#000) for text — use the foreground token', 'Use pure white (#FFF) for backgrounds — use the background token', 'Create new brand colors without updating this guide'],
  },
  voice: {
    dos: ['Write short, clear sentences', 'Use active voice', 'Be helpful and friendly'],
    donts: ['Use corporate jargon', 'Write passive-aggressive error messages', 'Over-explain or be verbose'],
  },
};
