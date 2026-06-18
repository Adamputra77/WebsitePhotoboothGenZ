/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PhotoFilter = 'normal' | 'warm' | 'cool' | 'bw' | 'retro' | 'vivid';

export type DecorativeFrame = 'none' | 'hearts' | 'stars' | 'flowers';

export type StripBackground = 'white' | 'black' | 'pink' | 'blue' | 'yellow' | 'purple';

export interface FilterOption {
  id: PhotoFilter;
  labelId: string; // Translation key
  cssFilter: string;
  previewClass: string;
}

export interface FrameOption {
  id: DecorativeFrame;
  labelId: string; // Translation key
  icon: string;
}

export interface BackgroundOption {
  id: StripBackground;
  labelId: string;
  hex: string;
  textClass: string;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export type UILanguage = 'id' | 'en';
