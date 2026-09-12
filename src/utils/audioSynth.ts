/**
 * Utility functions for Audio manipulation, Web Audio API analysis, and ambient synthesis.
 */

// Convert base64 WAV string to an audio Blob and object URL
export function base64ToAudioBlobUrl(base64: string, mimeType = "audio/wav"): { blob: Blob; url: string } {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const url = URL.createObjectURL(blob);
  return { blob, url };
}

// Download an audio blob as a file
export function downloadWavFile(blob: Blob, filename = "bangla-12s-voiceover.wav") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Class to generate ambient dramatic cinematic background drone using Web Audio API
export class AmbientAtmosphereSynth {
  private ctx: AudioContext | null = null;
  private oscNode1: OscillatorNode | null = null;
  private oscNode2: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public start(volume = 0.25) {
    this.init();
    if (!this.ctx || this.isPlaying) return;

    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), this.ctx.currentTime + 1.2);
      this.masterGain.connect(this.ctx.destination);

      // Deep sub-bass cinematic rumble (55Hz / A1)
      this.oscNode1 = this.ctx.createOscillator();
      this.oscNode1.type = "sine";
      this.oscNode1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Low harmonic drone (82.4Hz / E2)
      this.oscNode2 = this.ctx.createOscillator();
      this.oscNode2.type = "triangle";
      this.oscNode2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = "lowpass";
      droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.oscNode1.connect(droneFilter);
      this.oscNode2.connect(droneFilter);
      droneFilter.connect(oscGain);
      oscGain.connect(this.masterGain);

      // Ambient wind/earth tremor noise
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      // Brown noise generator for deep tectonic rumble
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 2.8;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      this.noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      this.oscNode1.start();
      this.oscNode2.start();
      this.noiseNode.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn("Could not start ambient synth:", e);
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0.0001, volume), this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      setTimeout(() => {
        try {
          this.oscNode1?.stop();
          this.oscNode2?.stop();
          this.noiseNode?.stop();
          this.oscNode1?.disconnect();
          this.oscNode2?.disconnect();
          this.noiseNode?.disconnect();
        } catch {
          // ignore
        }
        this.isPlaying = false;
      }, 550);
    } catch {
      this.isPlaying = false;
    }
  }
}
