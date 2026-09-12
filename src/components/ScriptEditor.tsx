import React, { useState } from 'react';
import { FileText, Copy, RotateCcw, Clock, Check, Layers, AlignLeft } from 'lucide-react';
import { ScriptLine } from '../types';
import { DEFAULT_BENGALI_TEXT } from '../data/defaultScript';

interface ScriptEditorProps {
  scriptText: string;
  onScriptChange: (text: string) => void;
  scriptLines: ScriptLine[];
  onResetDefault: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  scriptText,
  onScriptChange,
  scriptLines,
  onResetDefault,
}) => {
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');
  const [copied, setCopied] = useState(false);

  // Word and character stats
  const words = scriptText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = scriptText.length;
  // Dramatic pacing estimate: ~1.4 - 1.6 words per second with atmospheric pauses
  const estimatedSeconds = (wordCount * 0.7).toFixed(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200 font-['Outfit']">
            বাংলা ভয়েস অভার স্ক্রিপ্ট (Bengali Script)
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* View toggle */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('structured')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all ${
                viewMode === 'structured'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>লাইন ভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-all ${
                viewMode === 'raw'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>এডিটর</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onResetDefault}
            title="Reset to initial 12s prompt"
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all border border-zinc-700/50 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700/50 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>
        </div>
      </div>

      {/* Content depending on view mode */}
      {viewMode === 'structured' ? (
        <div className="space-y-3">
          {scriptLines.map((line, idx) => (
            <div
              key={line.id}
              className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-zinc-100 font-['Hind_Siliguri'] leading-snug">
                    {line.bn}
                  </p>
                  <p className="text-xs text-zinc-400 font-['Outfit'] italic mt-0.5">
                    {line.en}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-amber-400/80" />
                  <span>{line.startSec.toFixed(1)}s - {line.endSec.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <textarea
            id="script-editor-textarea"
            rows={7}
            value={scriptText}
            onChange={(e) => onScriptChange(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-['Hind_Siliguri'] text-base sm:text-lg leading-relaxed focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/40 resize-none transition-all"
            placeholder="এখানে বাংলা স্ক্রিপ্ট লিখুন..."
          />
        </div>
      )}

      {/* Script Statistics Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 font-['Outfit']">
        <div className="flex items-center space-x-3">
          <span>শব্দ: <strong className="text-zinc-200">{wordCount}</strong> টি</span>
          <span>•</span>
          <span>অক্ষর: <strong className="text-zinc-200">{charCount}</strong> টি</span>
          <span>•</span>
          <span>লাইন: <strong className="text-zinc-200">{scriptLines.length}</strong> টি</span>
        </div>

        <div className="flex items-center space-x-1.5 text-amber-400/90 font-mono text-[11px]">
          <span>১২ সেকেন্ড নাটকীয় কণ্ঠের জন্য আদর্শ পেসিং</span>
        </div>
      </div>
    </div>
  );
};
