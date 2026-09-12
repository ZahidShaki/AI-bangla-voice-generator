import React from 'react';
import { Sparkles, Mic, Radio, Volume2 } from 'lucide-react';

interface HeaderProps {
  hasAudio: boolean;
  isPlaying: boolean;
  onGenerateClick: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hasAudio,
  isPlaying,
  onGenerateClick,
  isGenerating,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-red-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-950/40">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight flex items-center font-['Outfit']">
                ১২ সেকেন্ড ভয়েস অভার
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                12s Bengali Studio
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Powered by <span className="text-zinc-300 font-mono">gemini-3.1-flash-tts-preview</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {isPlaying && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono font-medium">ON AIR</span>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-2 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>24kHz Studio Audio</span>
          </div>

          <button
            id="header-generate-btn"
            onClick={onGenerateClick}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-medium text-xs sm:text-sm font-['Outfit'] shadow-md shadow-amber-950/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hasAudio ? 'পুনরায় তৈরি করুন' : 'ভয়েস তৈরি করুন'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
