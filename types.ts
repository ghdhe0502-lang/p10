
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export type ScrollEffect = 'left' | 'right' | 'up' | 'down' | 'static' | 'blink' | 'scroll-up-down';
export type BorderStyle = 'none' | 'thin' | 'thick' | 'dashed' | 'corners';
export type DisplayMode = 'normal' | 'party' | 'pulse' | 'eco' | 'emergency';

export interface DisplayConfig {
  ipAddress: string;
  brightness: number;
  speed: number;
  font: string;
  clockMode: 'digital' | 'analog' | 'none';
  clockFormat: '12h' | '24h';
  showDate: boolean;
  showCalendar: boolean; // Fixed Hijri/Miladi overlay
  width: number;
  height: number;
  panelsX: number;
  panelsY: number;
  currentText: string;      // Message A
  secondaryText: string;    // Message B
  switchInterval: number;   // Seconds between switches
  scrollEffect: ScrollEffect;
  borderStyle: BorderStyle;
  isAutoBrightness: boolean;
  layout: 'centered' | 'top-message' | 'side-by-side';
  displayMode: DisplayMode;
}

export const FONTS = [
  'Standard',
  'Bold',
  'Italic',
  '7-Segment',
  'Dot-Matrix',
  'Arabic-Modern',
  'Neon-Glow',
  'Pixel-Art'
];

export const STANDARD_RESOLUTIONS = [
  { label: '1x1 (32x16)', x: 1, y: 1 },
  { label: '2x1 (64x16)', x: 2, y: 1 },
  { label: '3x1 (96x16)', x: 3, y: 1 },
  { label: '2x2 (64x32)', x: 2, y: 2 },
  { label: '4x2 (128x32)', x: 4, y: 2 }
];
