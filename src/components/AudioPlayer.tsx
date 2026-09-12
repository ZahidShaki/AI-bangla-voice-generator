import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Share2,
  Check,
  FastForward,
  Rewind,
} from 'lucide-react';
import { GeneratedAudioData, ScriptLine } from '../types';
import { AudioVisualizer } from './AudioVisualizer';
import { downloadWavFile, AmbientAtmosphereSynth } from '../utils/audioSynth';

interface AudioPlayerProps {
  audioData: GeneratedAudioData | null;
  scriptLines: ScriptLine[];
  onGenerateAgain: () => void;
  isGenerating: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioData,
  scriptLines,
  onGenerateAgain,
  isGenerating,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<AmbientAtmosphereSynth | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioData?.durationSeconds || 12.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [copied, setCopied] = useState(false);

  // Ambient soundscape options
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(0.22);

  // Initialize ambient synth
  useEffect(() => {
    synthRef.current = new AmbientAtmosphereSynth();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Update duration when new audio is loaded
  useEffect(() => {
    if (audioData) {
      setDuration(audioData.durationSeconds || 12.0);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [audioData]);

  // Handle Play/Pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      synthRef.current?.stop();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        if (ambientEnabled) {
          synthRef.current?.start(ambientVolume);
        }
      }).catch((e) => {
        console.warn("Audio play error:", e);
      });
    }
  };

  const handleSeek = (newTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(newTime, duration));
    setCurrentTime(audio.currentTime);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => {
      setIsPlaying(true);
      if (ambientEnabled) {
        synthRef.current?.start(ambientVolume);
      }
    });
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min(duration, audio.currentTime + seconds));
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleAmbientToggle = () => {
    const next = !ambientEnabled;
    setAmbientEnabled(next);
    if (!next) {
      synthRef.current?.stop();
    } else if (isPlaying) {
      synthRef.current?.start(ambientVolume);
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    synthRef.current?.setVolume(vol);
  };

  // Keyboard shortcut: Spacebar to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in textarea or input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Active line calculation
  const activeLine = scriptLines.find((line) => {
    return currentTime >= line.startSec && currentTime <= line.endSec;
  }) || (currentTime >= 11.5 ? scriptLines[scriptLines.length - 1] : scriptLines[0]);

  // Format seconds to mm:ss.d
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = (sec % 60).toFixed(1);
    const paddedSec = Number(remainingSec) < 10 ? `0${remainingSec}` : remainingSec;
    return `0${mins}:${paddedSec}`;
  };

  const handleDownload = () => {
    if (!audioData) return;
    // Decode base64 to blob
    const byteCharacters = atob(audioData.audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    downloadWavFile(blob, `bangla-12s-voiceover-${audioData.voiceUsed.toLowerCase()}.wav`);
  };

  const handleCopyScript = () => {
    const fullText = scriptLines.map((l) => l.bn).join('\n\n');
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 border border-zinc-800/80 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Subtle seismic tremor ambient glow */}
      <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none transition-opacity duration-700 ${isPlaying ? 'opacity-100 scale-110' : 'opacity-40'}`} />

      {/* Hidden Audio Element */}
      {audioData && (
        <audio
          ref={audioRef}
          src={audioData.blobUrl}
          loop={isLooping}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || audioData.durationSeconds);
            }
          }}
          onEnded={() => {
            if (!isLooping) {
              setIsPlaying(false);
              synthRef.current?.stop();
            }
          }}
        />
      )}

      {/* Top Bar: Teleprompter & Live Bengali Caption */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="uppercase tracking-widest font-semibold text-[11px] text-zinc-300 font-['Outfit']">
              টেলিপম্পটার / Live Caption
            </span>
          </div>
          <div className="font-mono text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-zinc-700/40">
            Voice: <span className="text-amber-400 font-bold">{audioData?.voiceUsed || 'Charon'}</span>
          </div>
        </div>

        {/* Dynamic active sentence card */}
        <div className="min-h-[105px] p-4 sm:p-5 rounded-xl bg-zinc-950/80 border border-amber-500/20 shadow-inner flex flex-col justify-center items-center text-center relative overflow-hidden transition-all">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-200 tracking-wide font-['Hind_Siliguri'] drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)] transition-all">
            {activeLine?.bn || 'একদিন সবকিছু বদলে যাবে…'}
          </div>
          <div className="text-xs sm:text-sm text-zinc-400 mt-1.5 font-['Outfit'] italic tracking-wide">
            "{activeLine?.en || 'One day, everything will change…'}"
          </div>
          <div className="text-[10px] font-mono text-amber-400/70 mt-1">
            Segment: {activeLine?.startSec.toFixed(1)}s - {activeLine?.endSec.toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Audio Waveform Visualizer */}
      <div className="mb-6">
        <AudioVisualizer
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          audioElement={audioRef.current}
        />
      </div>

      {/* Playback Controls & Timeline */}
      <div className="space-y-4">
        {/* Timeline Slider with High Precision */}
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs font-semibold text-amber-400 w-16 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative flex items-center">
            <input
              id="voiceover-timeline-slider"
              type="range"
              min="0"
              max={duration || 12}
              step="0.05"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 focus:outline-none transition-all"
            />
          </div>
          <span className="font-mono text-xs font-semibold text-zinc-400 w-16">
            {formatTime(duration)}
          </span>
        </div>

        {/* Core Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Main Playback Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="audio-replay-btn"
              onClick={handleRestart}
              title="Restart (0.0s)"
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-all active:scale-95 border border-zinc-700/50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="audio-rewind-btn"
              onClick={() => handleSkip(-2)}
              title="Skip -2s"
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-all active:scale-95 border border-zinc-700/50"
            >
              <Rewind className="w-4 h-4" />
            </button>

            {/* Giant Play/Pause Button */}
            <button
              id="audio-play-pause-btn"
              onClick={togglePlayPause}
              className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-950/60 transition-all transform active:scale-90"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              id="audio-forward-btn"
              onClick={() => handleSkip(2)}
              title="Skip +2s"
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-all active:scale-95 border border-zinc-700/50"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Speed Control Chips */}
            <div className="flex items-center space-x-1 bg-zinc-950/80 border border-zinc-800 rounded-xl p-1">
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 text-xs font-mono rounded-lg transition-all ${
                    playbackRate === rate
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Controls: Download & Copy */}
          <div className="flex items-center space-x-2">
            <button
              id="audio-copy-script-btn"
              onClick={handleCopyScript}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-['Outfit'] border border-zinc-700/50 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>স্ক্রিপ্ট কপি</span>
                </>
              )}
            </button>

            <button
              id="audio-download-btn"
              onClick={handleDownload}
              disabled={!audioData}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold font-['Outfit'] shadow-md shadow-amber-950/40 border border-amber-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড (.WAV)</span>
            </button>
          </div>
        </div>

        {/* Ambient Atmosphere Soundscape Switch (Native Web Audio Sub-bass Rumble) */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <button
              id="ambient-sound-toggle-btn"
              onClick={handleAmbientToggle}
              className={`p-2 rounded-lg border transition-all ${
                ambientEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              {ambientEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div>
              <div className="font-semibold text-zinc-200 flex items-center space-x-2">
                <span>সিনেমাটিক সাব-বেস ড্রোন (Cinematic Tremor Drone)</span>
                {ambientEnabled && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded font-mono">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                ভূমিকম্প ও ধ্বংসের গভীর আবহ সঙ্গীত ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে মিক্স হবে
              </p>
            </div>
          </div>

          {ambientEnabled && (
            <div className="flex items-center space-x-2 w-36">
              <span className="text-[10px] text-zinc-500 font-mono">Mix</span>
              <input
                id="ambient-volume-slider"
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={ambientVolume}
                onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] font-mono text-amber-400 w-7 text-right">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
