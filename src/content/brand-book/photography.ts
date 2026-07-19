import type { GalleryItem } from './types';

export const photographyStyle = {
  traits: ['Bright', 'Natural', 'Warm', 'Minimal backgrounds', 'High quality', 'Real food', 'Real restaurants'],
  avoid: ['Stock-looking images', 'Heavy filters', 'Overly staged compositions', 'Dark or moody tones'],
};

export const illustrationStyle = {
  traits: ['Minimal', 'Flat', 'Modern', 'Rounded shapes'],
  subjects: ['Food Photography', 'Mockups', 'Device Frames', 'Abstract Shapes'],
};

export const photographyGallery: GalleryItem[] = [
  { title: 'Photo 1', placeholderType: 'image' },
  { title: 'Photo 2', placeholderType: 'image' },
  { title: 'Photo 3', placeholderType: 'image' },
  { title: 'Photo 4', placeholderType: 'image' },
];
