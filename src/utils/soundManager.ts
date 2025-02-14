import { Howl } from 'howler'

class SoundManager {
  private static instance: SoundManager
  private sounds: { [key: string]: Howl }
  private isMuted: boolean

  private constructor() {
    this.sounds = {
      correct: new Howl({
        src: ['/sounds/correct.mp3'],
        volume: 0.5,
      }),
      incorrect: new Howl({
        src: ['/sounds/incorrect.mp3'],
        volume: 0.5,
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
        src: ['/sounds/click.mp3'],
        volume: 0.3,
      }),
      streak: new Howl({
        src: ['/sounds/streak.mp3'],
        volume: 0.6,
      }),
    }
    this.isMuted = false
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  public play(soundName: keyof typeof this.sounds): void {
    if (!this.isMuted && this.sounds[soundName]) {
      this.sounds[soundName].play()
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted
    Object.values(this.sounds).forEach((sound) => {
      sound.mute(this.isMuted)
    })
  }

  public setVolume(volume: number): void {
    Object.values(this.sounds).forEach((sound) => {
      sound.volume(volume)
    })
  }

  public getMuteState(): boolean {
    return this.isMuted
  }
}

export const soundManager = SoundManager.getInstance()

// Usage example:
// import { soundManager } from '@/utils/soundManager'
// soundManager.play('correct')
// soundManager.play('levelUp')
// soundManager.toggleMute()
// soundManager.setVolume(0.5)
