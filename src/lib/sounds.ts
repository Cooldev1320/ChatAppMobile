import Sound from 'react-native-sound';

class SoundService {
  private sounds: { [key: string]: Sound } = {};
  private enabled = true;

  constructor() {
    // Enable playback in silence mode
    Sound.setCategory('Playback');
  }

  private createBeep(frequency: number, duration: number, volume: number = 0.1) {
    if (!this.enabled) return;
    
    // For React Native, we'll use a simple approach with the Sound library
    // You can replace this with actual sound files if needed
    console.log(`Playing beep: ${frequency}Hz for ${duration}ms at volume ${volume}`);
    
    // Create a simple beep using the system sound
    // This is a simplified version - you can enhance it with actual audio files
    try {
      // For now, we'll just log the sound parameters
      // In a real implementation, you would load actual sound files
      console.log(`Beep: ${frequency}Hz, ${duration}ms, volume: ${volume}`);
    } catch (error) {
      console.log('Error playing beep:', error);
    }
  }

  playMessageReceived(): void {
    this.createBeep(800, 100, 0.05);
  }

  playMessageSent(): void {
    this.createBeep(600, 80, 0.03);
  }

  playUserJoined(): void {
    this.createBeep(500, 150, 0.04);
  }

  playError(): void {
    this.createBeep(300, 200, 0.06);
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundService = new SoundService();
