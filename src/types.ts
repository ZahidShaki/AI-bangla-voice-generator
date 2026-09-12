export interface ScriptLine {
  id: string;
  bn: string;
  en: string;
  startSec: number;
  endSec: number;
}

export type VoiceOption = 'Charon' | 'Fenrir' | 'Kore' | 'Puck' | 'Zephyr';

export type ToneOption = 'dramatic' | 'somber' | 'urgent' | 'inspirational';

export interface VoiceoverSettings {
  voice: VoiceOption;
  tone: ToneOption;
  targetSeconds: number;
  bgAtmosphere: boolean;
  bgVolume: number;
}

export interface GeneratedAudioData {
  audioBase64: string;
  blobUrl: string;
  durationSeconds: number;
  sampleRate: number;
  voiceUsed: VoiceOption;
  timestamp: number;
}
