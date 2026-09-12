import { ScriptLine } from '../types';

export const DEFAULT_BENGALI_TEXT = `একদিন সবকিছু বদলে যাবে…
যখন পৃথিবী প্রচণ্ড কেঁপে উঠবে…
পাহাড়গুলোও স্থির থাকবে না…
সেই দিনটি সত্যিই আসবে।
তোমার কি সেই দিনের জন্য প্রস্তুতি আছে?`;

export const DEFAULT_SCRIPT_LINES: ScriptLine[] = [
  {
    id: 'line-1',
    bn: 'একদিন সবকিছু বদলে যাবে…',
    en: 'One day, everything will change…',
    startSec: 0.0,
    endSec: 2.5,
  },
  {
    id: 'line-2',
    bn: 'যখন পৃথিবী প্রচণ্ড কেঁপে উঠবে…',
    en: 'When the earth will violently shake…',
    startSec: 2.5,
    endSec: 5.1,
  },
  {
    id: 'line-3',
    bn: 'পাহাড়গুলোও স্থির থাকবে না…',
    en: 'Even the mountains will not remain still…',
    startSec: 5.1,
    endSec: 7.7,
  },
  {
    id: 'line-4',
    bn: 'সেই দিনটি সত্যিই আসবে।',
    en: 'That day will truly come.',
    startSec: 7.7,
    endSec: 9.6,
  },
  {
    id: 'line-5',
    bn: 'তোমার কি সেই দিনের জন্য প্রস্তুতি আছে?',
    en: 'Do you have preparation for that day?',
    startSec: 9.6,
    endSec: 12.0,
  },
];

export const VOICE_PROFILES = [
  {
    id: 'Charon' as const,
    name: 'Charon',
    gender: 'Deep Male',
    character: 'Solemn, low resonant & cinematic gravitas (Recommended for apocalyptic tone)',
    badge: 'Best for 12s Drama',
  },
  {
    id: 'Fenrir' as const,
    name: 'Fenrir',
    gender: 'Intense Male',
    character: 'Powerful, gravelly, dramatic warning',
    badge: 'Intense',
  },
  {
    id: 'Kore' as const,
    name: 'Kore',
    gender: 'Female',
    character: 'Poignant, reflective, emotionally captivating',
    badge: 'Reflective',
  },
  {
    id: 'Zephyr' as const,
    name: 'Zephyr',
    gender: 'Male',
    character: 'Balanced narrator, steady and clear delivery',
    badge: 'Narrative',
  },
  {
    id: 'Puck' as const,
    name: 'Puck',
    gender: 'Expressive Male',
    character: 'Expressive and animated storytelling',
    badge: 'Expressive',
  },
];
