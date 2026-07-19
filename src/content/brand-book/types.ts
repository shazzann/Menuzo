export type PlaceholderType =
  | "text"
  | "image"
  | "gallery"
  | "logo"
  | "download"
  | "video";

export interface NavigationItem {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  subsections?: NavigationItem[];
}

export interface BrandSection {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
}

export interface BrandValue {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface PersonaType {
  title: string;
  age: string;
  problems: string[];
  goals: string[];
}

export interface VoiceExample {
  context: string;
  doSay: string;
  dontSay: string;
}

export interface DesignPrinciple {
  title: string;
  description: string;
  icon: string;
}

export interface ColorToken {
  name: string;
  token: string;
  hex: string;
  rgb: string;
  hsl: string;
  cssVariable: string;
  tailwindClass: string;
  figmaVariable: string;
  usage: string;
  contrastInformation: string;
}

export interface TypographyScale {
  level: "Display" | "H1" | "H2" | "H3" | "H4" | "Body" | "Body SM" | "Caption" | "Button" | "Code";
  family: string;
  size: string;
  weight: number;
  lineHeight: string;
  letterSpacing: string;
  usage: string;
}

export interface LogoVariant {
  name: string;
  imagePath?: string;
  placeholderType: PlaceholderType;
  description?: string;
}

export interface Application {
  title: string;
  icon: string;
  status: "available" | "coming-soon";
  imagePath?: string;
}

export interface DownloadAsset {
  title: string;
  format: string;
  size: string;
  fileUrl?: string;
  placeholderType: PlaceholderType;
}

export interface TimelineItem {
  version: string;
  title: string;
  date: string;
  status: "released" | "current" | "planned";
}

export interface AccessibilityItem {
  title: string;
  description: string;
  status: "implemented" | "in-progress" | "planned";
}

export interface Quote {
  text: string;
  author?: string;
}

export interface Resource {
  title: string;
  url: string;
  description: string;
}

export interface GalleryItem {
  title: string;
  imagePath?: string;
  placeholderType: PlaceholderType;
}
