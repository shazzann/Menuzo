import type { VoiceExample } from './types';

export const brandVoice = {
  toneWords: ['Friendly', 'Professional', 'Confident', 'Clear', 'Simple', 'Helpful'],
  writingStyle: ['Short sentences', 'Simple English', 'Active voice', 'Avoid jargon'],
};

export const voiceExamples: VoiceExample[] = [
  {
    context: 'CTA Copy',
    doSay: 'Create your menu in minutes.',
    dontSay: 'Utilize our comprehensive restaurant digitization ecosystem.',
  },
  {
    context: 'Error Message',
    doSay: "Something went wrong. We're looking into it.",
    dontSay: 'Error 500: Internal server malfunction detected.',
  },
  {
    context: 'Empty State',
    doSay: 'No items yet — add your first dish to get started.',
    dontSay: 'There are currently no food items in this category.',
  },
  {
    context: 'Success',
    doSay: 'Menu updated! Your changes are live.',
    dontSay: 'The menu has been successfully updated and published.',
  },
];

export const messagingFramework = {
  problem: 'Printing menus is expensive and they go stale instantly.',
  solution: 'Create a QR menu in minutes.',
  benefit: 'Update anytime, from anywhere.',
  result: 'Save money and impress customers.',
};
