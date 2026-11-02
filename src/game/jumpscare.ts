import type { Settings } from "./settings";

// Random wait between jumpscares while playing, in milliseconds
export const MIN_DELAY = 25_000;
export const MAX_DELAY = 70_000;
export const DURATION = 1400;

export function nextDelay() {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

let context: AudioContext | null = null;

// A synthesized screech (falling sawtooth over a burst of noise), so no audio file is needed
export function playScream(settings: Settings) {
  if (settings.muteAll === "On") return;
  const volume = (settings.masterVolume / 100) * (settings.soundEffects / 100);
  if (volume === 0) return;

  context ??= new AudioContext();
  const ctx = context;
  const now = ctx.currentTime;
  const length = 1.1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume * 0.6, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  gain.connect(ctx.destination);

  const voice = ctx.createOscillator();
  voice.type = "sawtooth";
  voice.frequency.setValueAtTime(900, now);
  voice.frequency.exponentialRampToValueAtTime(180, now + length);
  const wobble = ctx.createOscillator();
  const wobbleDepth = ctx.createGain();
  wobble.frequency.value = 28;
  wobbleDepth.gain.value = 60;
  wobble.connect(wobbleDepth).connect(voice.frequency);
  voice.connect(gain);

  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.5;
  noise.connect(noiseGain).connect(gain);

  for (const node of [voice, wobble, noise]) {
    node.start(now);
    node.stop(now + length);
  }
}
