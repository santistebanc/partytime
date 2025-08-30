// Simple sound effect system using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  async loadSound(name: string, frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playBuzzer() {
    this.loadSound('buzzer', 800, 0.2, 'square');
  }

  playCorrect() {
    this.loadSound('correct', 523.25, 0.3, 'sine'); // C5
    setTimeout(() => this.loadSound('correct2', 659.25, 0.3, 'sine'), 100); // E5
    setTimeout(() => this.loadSound('correct3', 783.99, 0.3, 'sine'), 200); // G5
  }

  playIncorrect() {
    this.loadSound('incorrect', 220, 0.5, 'sawtooth'); // A3
  }

  playGameStart() {
    this.loadSound('start', 440, 0.2, 'sine'); // A4
    setTimeout(() => this.loadSound('start2', 554.37, 0.2, 'sine'), 100); // C#5
    setTimeout(() => this.loadSound('start3', 659.25, 0.2, 'sine'), 200); // E5
  }

  playGameEnd() {
    this.loadSound('end', 659.25, 0.3, 'sine'); // E5
    setTimeout(() => this.loadSound('end2', 523.25, 0.3, 'sine'), 150); // C5
    setTimeout(() => this.loadSound('end3', 392, 0.3, 'sine'), 300); // G4
  }
}

export const soundManager = new SoundManager();
