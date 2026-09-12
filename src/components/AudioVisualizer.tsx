import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  audioElement: HTMLAudioElement | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  currentTime,
  duration,
  onSeek,
  audioElement,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Pre-generate stable pseudo-waveform bar heights for the visualizer
  const barCount = 64;
  const barsDataRef = useRef<number[]>([]);
  if (barsDataRef.current.length === 0) {
    const data: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Dynamic profile representing dramatic speech: quiet pauses between sentences
      const lineProgress = (i / barCount) * 5; // 5 sentences
      const sentencePhase = lineProgress % 1.0;
      let amplitude = Math.sin(sentencePhase * Math.PI) * 0.8 + 0.15;
      // Ellipsis pauses at the end of each line
      if (sentencePhase > 0.82) {
        amplitude = 0.08 + Math.random() * 0.06;
      } else {
        amplitude += (Math.random() * 0.2 - 0.1);
      }
      data.push(Math.max(0.08, Math.min(0.95, amplitude)));
    }
    barsDataRef.current = data;
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!duration || duration <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const progress = duration > 0 ? currentTime / duration : 0;
      const barWidth = (width / barCount) - 3;
      const currentBarIndex = Math.floor(progress * barCount);

      phase += 0.08;

      // Draw background center guideline
      ctx.fillStyle = 'rgba(63, 63, 70, 0.25)';
      ctx.fillRect(0, height / 2 - 0.5, width, 1);

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 3);
        let barHeightRatio = barsDataRef.current[i] || 0.3;

        // If playing and near the current playback position, add dynamic voice flutter
        if (isPlaying && Math.abs(i - currentBarIndex) < 4) {
          const flutter = Math.sin(phase * 4 + i) * 0.25;
          barHeightRatio = Math.max(0.1, Math.min(1.0, barHeightRatio + flutter));
        }

        const barHeight = Math.max(6, barHeightRatio * (height * 0.78));
        const y = (height - barHeight) / 2;

        const isPast = i <= currentBarIndex;
        const isCurrent = i === currentBarIndex;

        if (isCurrent) {
          // Playhead bar with glow
          ctx.fillStyle = '#f59e0b'; // amber-500
          ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
          ctx.shadowBlur = 10;
        } else if (isPast) {
          // Played bars - warm amber gradient
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#d97706');
          ctx.fillStyle = gradient;
          ctx.shadowBlur = 0;
        } else {
          // Unplayed bars - muted zinc
          ctx.fillStyle = 'rgba(113, 113, 122, 0.35)';
          ctx.shadowBlur = 0;
        }

        // Rounded bar top and bottom
        const radius = Math.min(barWidth / 2, 2.5);
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      // Draw glowing playhead cursor line
      const playheadX = progress * width;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(Math.max(0, Math.min(width - 2, playheadX - 1)), 4, 2, height - 8);
      ctx.shadowBlur = 0;

      if (isPlaying) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  // Resize canvas according to container width
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth * (window.devicePixelRatio || 1);
      canvasRef.current.height = 120 * (window.devicePixelRatio || 1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full relative group cursor-pointer select-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-[120px] rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/40 transition-colors shadow-inner"
        style={{ imageRendering: 'crisp-edges' }}
      />
      {/* 12-second ruler markers */}
      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1.5 px-2">
        <span>00:00.0s</span>
        <span>00:03.0s</span>
        <span className="text-amber-400/80 font-bold">00:06.0s</span>
        <span>00:09.0s</span>
        <span className="text-zinc-300 font-semibold">00:12.0s</span>
      </div>
    </div>
  );
};
