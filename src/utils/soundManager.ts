import { Howl } from 'howler'

// Define all available sound effects
export type SoundEffect = 
  | 'achievement'
  | 'click'
  | 'correct'
  | 'incorrect'
  | 'levelUp'
  | 'streak'
  | 'connected'
  | 'drag'
  | 'drop';

class SoundManager {
  private static instance: SoundManager
  private sounds: { [key in SoundEffect]?: Howl } = {}
  private isMuted: boolean = false

  private constructor() {
    this.loadSounds();
    this.loadPreference();
  }

  private loadSounds(): void {
    this.sounds = {
      correct: new Howl({
        src: ['/sounds/correct.mp3'],
        volume: 0.2,
      }),
      incorrect: new Howl({
        src: ['/sounds/incorrect.mp3'],
        volume: 0.2,
      }),
      levelUp: new Howl({
        src: ['/sounds/level-up.mp3'],
        volume: 0.7,
      }),
      achievement: new Howl({
        src: ['/sounds/achievement.mp3'],
        volume: 0.7,
      }),
      click: new Howl({
        src: ['/sounds/click1.wav'],
        volume: 0.3,
      }),
      streak: new Howl({
        src: ['/sounds/streak.mp3'],
        volume: 0.6,
      }),
      connected: new Howl({
        src: ['/sounds/click1.wav'],
        volume: 0.4,
      }),
      // You may want to add these additional sounds
      drag: new Howl({
        src: ['/sounds/drag.mp3'],
        volume: 0.3,
      }),
      drop: new Howl({
        src: ['/sounds/click1.wav'],
        volume: 0.4,
      }),
    }
  }

  private loadPreference(): void {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('soundMuted');
      if (savedPreference !== null) {
        this.isMuted = savedPreference === 'true';
        Object.values(this.sounds).forEach((sound) => {
          sound.mute(this.isMuted);
        });
      } else {
        this.isMuted = false;
      }
    } else {
      this.isMuted = false;
    }
  }

  private savePreference(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundMuted', String(this.isMuted));
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  public play(soundName: SoundEffect): void {
    if (!this.isMuted && this.sounds[soundName]) {
      this.sounds[soundName]?.play()
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted
    Object.values(this.sounds).forEach((sound) => {
      sound.mute(this.isMuted)
    })
    this.savePreference();
  }

  public setVolume(volume: number): void {
    Object.values(this.sounds).forEach((sound) => {
      sound.volume(volume)
    })
  }

  public getMuteState(): boolean {
    return this.isMuted
  }

  public addSound(name: SoundEffect, path: string, volume: number = 0.5): void {
    this.sounds[name] = new Howl({
      src: [path],
      volume: volume,
      mute: this.isMuted,
    });
  }
}

export const soundManager = SoundManager.getInstance()