import React from 'react';
import { Sparkles, Mic, Sliders, Flame, ShieldAlert, Compass, Music } from 'lucide-react';
import { VoiceOption, ToneOption, VoiceoverSettings } from '../types';
import { VOICE_PROFILES } from '../data/defaultScript';

interface VoiceoverControlsProps {
  settings: VoiceoverSettings;
  onSettingsChange: (settings: VoiceoverSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const VoiceoverControls: React.FC<VoiceoverControlsProps> = ({
  settings,
  onSettingsChange,
  onGenerate,
  isGenerating,
}) => {
  const tones: { id: ToneOption; labelBn: string; labelEn: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'dramatic',
      labelBn: 'সিনেমাটিক ট্রেইলার',
      labelEn: 'Cinematic Trailer',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      desc: 'গভীর, গম্ভীর ও ধ্বংসস্তূপের ভারী স্বর',
    },
    {
      id: 'urgent',
      labelBn: 'জরুরি সতর্কবার্তা',
      labelEn: 'Urgent Warning',
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      desc: 'উদ্বেগজনক, স্পষ্ট এবং উচ্চ টানটান ভাব',
    },
    {
      id: 'somber',
      labelBn: 'শান্ত ও অন্তর্মুখী',
      labelEn: 'Somber Reflection',
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      desc: 'ধীর, আবেগপূর্ণ এবং গভীর অনুভূতির সুর',
    },
    {
      id: 'inspirational',
      labelBn: 'মহিমান্বিত গাম্ভীর্য',
      labelEn: 'Majestic Gravity',
      icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
      desc: 'রাজকীয় ও দার্শনিক পরিপক্ব উচ্চারণ',
    },
  ];

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Section 1: Voice Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2 font-['Outfit']">
            <Mic className="w-4 h-4 text-amber-400" />
            <span>কণ্ঠ নির্বাচন (Voice Actor)</span>
          </label>
          <span className="text-[11px] text-zinc-500 font-mono">Gemini Flash TTS Voices</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {VOICE_PROFILES.map((v) => {
            const isSelected = settings.voice === v.id;
            return (
              <button
                key={v.id}
                id={`voice-select-${v.id.toLowerCase()}`}
                type="button"
                onClick={() => onSettingsChange({ ...settings, voice: v.id })}
                className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-sm ${isSelected ? 'text-amber-300' : 'text-zinc-200 group-hover:text-white'}`}>
                    {v.name}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isSelected ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {v.gender}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {v.character}
                </p>
                {v.badge && (
                  <span className="inline-block mt-1.5 text-[9px] font-mono text-amber-400/80 tracking-wide">
                    ★ {v.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Dramatic Tone & Mood */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2 font-['Outfit']">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>নাটকীয় আবহ ও ভাব (Dramatic Tone)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {tones.map((t) => {
            const isSelected = settings.tone === t.id;
            return (
              <button
                key={t.id}
                id={`tone-select-${t.id}`}
                type="button"
                onClick={() => onSettingsChange({ ...settings, tone: t.id })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {t.icon}
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                    {t.labelBn}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-['Outfit'] mb-1">
                  {t.labelEn}
                </p>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Target Duration Slider (Target: 12 seconds) */}
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-['Outfit']">
              টার্গেট সময়সীমা (Target Duration)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
              ১২ সেকেন্ড (12s)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            মডেলকে নির্দিষ্ট গতি এবং বিরতিতে আবৃত্তি করার নির্দেশ দেওয়া হবে
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-64">
          <span className="text-xs font-mono text-zinc-400">10s</span>
          <input
            id="target-duration-slider"
            type="range"
            min="10"
            max="15"
            step="1"
            value={settings.targetSeconds}
            onChange={(e) =>
              onSettingsChange({ ...settings, targetSeconds: parseInt(e.target.value, 10) })
            }
            className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-xs font-mono text-amber-400 font-bold">
            {settings.targetSeconds}s
          </span>
        </div>
      </div>

      {/* Big Action Button */}
      <button
        id="generate-voiceover-main-btn"
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-base sm:text-lg font-['Outfit'] shadow-xl shadow-amber-950/60 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-400/40"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-3 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            <span>১২ সেকেন্ড ভয়েস অভার তৈরি হচ্ছে...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="font-['Hind_Siliguri']">১২ সেকেন্ডের ভয়েস অভার তৈরি করুন (Generate 12s Voiceover)</span>
          </>
        )}
      </button>
    </div>
  );
};
