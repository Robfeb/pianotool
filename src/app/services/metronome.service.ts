import { Injectable, signal, effect, inject } from '@angular/core';
import * as Tone from 'tone';
import { AudioService } from './audio.service';

@Injectable({
  providedIn: 'root'
})
export class MetronomeService {
  private audio = inject(AudioService);
  
  // State Signals
  readonly bpm = signal<number>(this.loadPref('bpm', 100));
  readonly isPlaying = signal<boolean>(false);
  readonly accentEnabled = signal<boolean>(this.loadPref('accentEnabled', true));
  readonly beatsPerMeasure = signal<number>(this.loadPref('beatsPerMeasure', 4));
  readonly currentBeatIndex = signal<number>(-1); // -1 when stopped or between beats

  private loop: Tone.Loop | null = null;
  private currentBeat = 0;
  private synth: Tone.MembraneSynth | null = null;

  constructor() {
    this.initAudio();

    // Persist changes
    effect(() => {
      this.savePref('bpm', this.bpm());
      this.savePref('accentEnabled', this.accentEnabled());
      this.savePref('beatsPerMeasure', this.beatsPerMeasure());
      
      // Update Tone.Transport BPM immediately
      Tone.getTransport().bpm.value = this.bpm();
    });
  }

  private initAudio() {
    this.synth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.01, release: 0.1 }
    }).toDestination();
    this.synth.volume.value = -10;

    this.loop = new Tone.Loop(time => {
      const isAccent = this.accentEnabled() && this.currentBeat === 0;
      const note = isAccent ? 'C3' : 'C2';
      
      this.synth?.triggerAttackRelease(note, '32n', time);
      
      // Update UI signal (use Draw for precise sync with audio)
      const beatValue = this.currentBeat;
      Tone.getDraw().schedule(() => {
        this.currentBeatIndex.set(beatValue);
      }, time);

      // Increment beat for next loop
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure();
    }, '4n');
  }

  async toggle() {
    await this.audio.ensureContext();
    
    if (this.isPlaying()) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    this.currentBeat = 0;
    Tone.getTransport().start();
    this.loop?.start(0);
    this.isPlaying.set(true);
  }

  stop() {
    this.loop?.stop();
    Tone.getTransport().stop();
    this.isPlaying.set(false);
    this.currentBeatIndex.set(-1);
  }

  setBpm(value: number) {
    const safeBpm = Math.min(240, Math.max(40, value));
    this.bpm.set(safeBpm);
  }

  // Persistence helpers
  private savePref(key: string, value: any) {
    localStorage.setItem(`metronome_${key}`, JSON.stringify(value));
  }

  private loadPref<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(`metronome_${key}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn(`Failed to parse localStorage key metronome_${key}:`, e);
        return defaultValue;
      }
    }
    return defaultValue;
  }
}
