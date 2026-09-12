import React, { useState, useEffect, useCallback } from 'react';
import {
  Mic,
  Radio,
  Sparkles,
  AlertCircle,
  Film,
  Download,
  Flame,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Header } from './components/Header';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceoverControls } from './components/VoiceoverControls';
import { ScriptEditor } from './components/ScriptEditor';
import {
  DEFAULT_BENGALI_TEXT,
  DEFAULT_SCRIPT_LINES,
} from './data/defaultScript';
import {
  VoiceoverSettings,
  GeneratedAudioData,
  ScriptLine,
} from './types';
import { base64ToAudioBlobUrl } from './utils/audioSynth';

export default function App() {
  const [scriptText, setScriptText] = useState(DEFAULT_BENGALI_TEXT);
  const [scriptLines, setScriptLines] = useState<ScriptLine[]>(DEFAULT_SCRIPT_LINES);
  const [settings, setSettings] = useState<VoiceoverSettings>({
    voice: 'Charon',
    tone: 'dramatic',
    targetSeconds: 12,
    bgAtmosphere: true,
    bgVolume: 0.22,
  });

  const [audioData, setAudioData] = useState<GeneratedAudioData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Parse script text into lines with estimated 12-second timing segments
  const updateScript = useCallback((text: string) => {
    setScriptText(text);
    const rawLines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) {
      setScriptLines([]);
      return;
    }

    // Default translations mapping for the original text
    const enMap: Record<string, string> = {
      'একদিন সবকিছু বদলে যাবে…': 'One day, everything will change…',
      'যখন পৃথিবী প্রচণ্ড কেঁপে উঠবে…': 'When the earth will violently shake…',
      'পাহাড়গুলোও স্থির থাকবে না…': 'Even the mountains will not remain still…',
      'সেই দিনটি সত্যিই আসবে।': 'That day will truly come.',
      'তোমার কি সেই দিনের জন্য প্রস্তুতি আছে?': 'Do you have preparation for that day?',
    };

    const targetSec = settings.targetSeconds || 12;
    const timePerLine = targetSec / rawLines.length;

    const parsed: ScriptLine[] = rawLines.map((line, idx) => ({
      id: `line-${idx + 1}`,
      bn: line,
      en: enMap[line] || `Line ${idx + 1} narration`,
      startSec: Number((idx * timePerLine).toFixed(1)),
      endSec: Number(((idx + 1) * timePerLine).toFixed(1)),
    }));

    setScriptLines(parsed);
  }, [settings.targetSeconds]);

  const handleResetDefault = () => {
    setScriptText(DEFAULT_BENGALI_TEXT);
    setScriptLines(DEFAULT_SCRIPT_LINES);
    setSettings((prev) => ({ ...prev, targetSeconds: 12 }));
  };

  // Main generator function calling backend Gemini TTS
  const handleGenerateVoiceover = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: scriptText,
          voice: settings.voice,
          tone: settings.tone,
          targetSeconds: settings.targetSeconds,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'ভয়েস অভার তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }

      // Convert returned base64 WAV to Blob URL
      const { url } = base64ToAudioBlobUrl(data.audioBase64, 'audio/wav');

      const generated: GeneratedAudioData = {
        audioBase64: data.audioBase64,
        blobUrl: url,
        durationSeconds: data.durationSeconds || settings.targetSeconds,
        sampleRate: data.sampleRate || 24000,
        voiceUsed: data.voiceUsed || settings.voice,
        timestamp: Date.now(),
      };

      setAudioData(generated);
      setSuccessMessage(`সফলভাবে ১২ সেকেন্ডের ভয়েস অভার তৈরি হয়েছে (${data.durationSeconds}s)!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      console.error('Error generating voiceover:', err);
      const msg = err instanceof Error ? err.message : 'ভয়েস অভার তৈরিতে ব্যর্থ হয়েছে।';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on first visit so user immediately has the voiceover ready to hear!
  useEffect(() => {
    handleGenerateVoiceover();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950 font-['Outfit']">
      {/* App Header */}
      <Header
        hasAudio={!!audioData}
        isPlaying={false}
        onGenerateClick={handleGenerateVoiceover}
        isGenerating={isGenerating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Banner Alert if error or success */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">ত্রুটি (Error)</p>
              <p className="text-red-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 flex items-center space-x-3 shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-sm font-medium">
              {successMessage}
            </div>
          </div>
        )}

        {/* Hero Context & Overview Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-amber-950/30 border border-zinc-800/80 p-6 sm:p-7 overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>১২ সেকেন্ড ট্রেইলার ও রিলস ভয়েস অভার</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-['Cinzel']">
                একদিন সবকিছু বদলে যাবে…
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-['Hind_Siliguri'] leading-relaxed">
                কেয়ামত বা পৃথিবীর মহাপ্রলয়ের গভীর উপলব্ধিমূলক ৫টি বাক্য দিয়ে ১২ সেকেন্ডের জন্য অপটিমাইজড সিনেমাটিক ভয়েস অভার স্টুডিও।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center min-w-[110px]">
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Duration</div>
                <div className="text-xl font-bold text-amber-400 font-mono">
                  {audioData ? `${audioData.durationSeconds}s` : '12.0s'}
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center min-w-[110px]">
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Model</div>
                <div className="text-xs font-semibold text-zinc-200 mt-1 font-mono">
                  Flash TTS
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center min-w-[110px]">
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-mono">Quality</div>
                <div className="text-xs font-semibold text-zinc-200 mt-1 font-mono">
                  24kHz WAV
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Audio Player, Waveform, Teleprompter */}
          <div className="lg:col-span-7 space-y-6">
            <AudioPlayer
              audioData={audioData}
              scriptLines={scriptLines}
              onGenerateAgain={handleGenerateVoiceover}
              isGenerating={isGenerating}
            />

            {/* Script Breakdown & Line Teleprompter */}
            <ScriptEditor
              scriptText={scriptText}
              onScriptChange={updateScript}
              scriptLines={scriptLines}
              onResetDefault={handleResetDefault}
            />
          </div>

          {/* Right Column: Voice & Dramatic Settings */}
          <div className="lg:col-span-5 space-y-6">
            <VoiceoverControls
              settings={settings}
              onSettingsChange={setSettings}
              onGenerate={handleGenerateVoiceover}
              isGenerating={isGenerating}
            />

            {/* Video Production & Export Tips Card */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-zinc-300 font-bold uppercase tracking-wider">
                <Film className="w-4 h-4 text-amber-400" />
                <span>ভিডিও এডিটর ব্যবহার নির্দেশিকা</span>
              </div>
              <ul className="space-y-2 text-zinc-400 leading-relaxed font-['Hind_Siliguri']">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                  <span><strong>CapCut / Premiere Pro:</strong> ডাউনলোডকৃত <code className="text-amber-300 font-mono">.wav</code> ফাইলটি সরাসরি আপনার টাইমলাইনে ১ নম্বর অডিও ট্র্যাকে রাখুন।</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                  <span><strong>ভিজুয়াল কাটস (Visual Cuts):</strong> প্রতিটি বাক্য বদলের সময় (২.৫ সে., ৫.১ সে., ৭.৭ সে., ৯.৬ সে.) ড্রোন শট বা ভূমিকম্পের সিনেমাটিক ক্লিপ পরিবর্তন করুন।</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                  <span><strong>সাব-বেস অ্যাম্বিয়েন্স:</strong> ভিডিওর জন্য চাইলে উপরের সিনেমাটিক ড্রোন চালু রেখে একসাথে পূর্ণ আবহ অনুভব করতে পারেন।</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-amber-400/80" />
            <span>১২ সেকেন্ড বাংলা ভয়েস অভার স্টুডিও • Gemini 3.1 Flash TTS</span>
          </div>
          <div className="text-zinc-500 font-mono">
            Lossless 24kHz Audio • Zero External CDN Dependencies
          </div>
        </div>
      </footer>
    </div>
  );
}
