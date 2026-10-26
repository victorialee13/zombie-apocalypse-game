import type { Settings } from "./settings";

// Drop the track into public/audio/ under this name
const MUSIC_SRC = "/audio/background.mp3";

// One shared track, so the music keeps playing while moving between pages
let music: HTMLAudioElement | null = null;

function getMusic() {
  if (!music) {
    music = new Audio(MUSIC_SRC);
    music.loop = true;
  }
  return music;
}

// Music volume is scaled by master volume, and Mute all silences it
export function applyMusicVolume(settings: Settings) {
  const audio = getMusic();
  audio.volume = (settings.masterVolume / 100) * (settings.music / 100);
  audio.muted = settings.muteAll === "On";
}

// Browsers block audio until the player interacts with the page, so this can reject
export function playMusic() {
  return getMusic().play();
}
