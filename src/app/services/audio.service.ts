import { Injectable, signal } from '@angular/core';
import * as Tone from 'tone';

export interface SoundPreset {
  id: string;
  label: string;
  labelEs: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: 'grand-piano',    label: '🎹 Grand Piano',    labelEs: '🎹 Piano de Cola' },
  { id: 'electric-piano', label: '⚡ Electric Piano',  labelEs: '⚡ Piano Eléctrico' },
  { id: 'strings',        label: '🎻 Strings',         labelEs: '🎻 Cuerdas' },
  { id: 'brass',          label: '🎺 Brass',           labelEs: '🎺 Metales' },
  { id: 'pure-sine',      label: '🎵 Pure Sine',       labelEs: '🎵 Onda Pura' },
  { id: 'organ',          label: '🎛️ Organ',           labelEs: '🎛️ Órgano' },
  { id: 'bell',           label: '🔔 Bell',            labelEs: '🔔 Campana' },
  { id: 'pad',            label: '🌊 Pad',             labelEs: '🌊 Pad Ambiental' },
  { id: 'pluck',          label: '🎸 Pluck',           labelEs: '🎸 Punteo' },
  { id: 'wobble',         label: '🌀 Wobble Lead',     labelEs: '🌀 Sintetizador' },
  // New 10 Sounds
  { id: 'drumset',        label: '🥁 Drumset',         labelEs: '🥁 Batería' },
  { id: 'hangpad',        label: '🛸 Hangpad',         labelEs: '🛸 Hangpad' },
  { id: 'winds',          label: '🎷 Winds',           labelEs: '🎷 Vientos' },
  { id: 'flute',          label: '🌬️ Flute',           labelEs: '🌬️ Flauta' },
  { id: 'cello',          label: '🎻 Cello',           labelEs: '🎻 Violonchelo' },
  { id: 'harpsichord',    label: '🎹 Harpsichord',     labelEs: '🎹 Clavicémbalo' },
  { id: 'dream-pad',      label: '🌌 Dream Pad',       labelEs: '🌌 Pad de Ensueño' },
  { id: 'overdrive',      label: '🎸 Overdrive',       labelEs: '🎸 Distorsión' },
  { id: 'oboe',           label: '🎷 Oboe',            labelEs: '🎷 Oboe' },
  { id: 'accordion',      label: '🪗 Accordion',       labelEs: '🪗 Acordeón' },
];

type ActiveSynth = Tone.PolySynth | null;

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private synth: ActiveSynth = null;
  private pluckPool: Tone.PluckSynth[] = [];
  private readonly PLUCK_POOL_SIZE = 8;

  readonly selectedPreset = signal<string>('grand-piano');
  private isPluck = false;

  constructor() {
    this.buildSynth('grand-piano');
  }

  switchPreset(id: string) {
    this.releaseAll();
    this.disposeSynth();
    this.buildSynth(id);
    this.selectedPreset.set(id);
  }

  private buildSynth(id: string) {
    this.isPluck = id === 'pluck';

    if (this.isPluck) {
      this.pluckPool = Array.from({ length: this.PLUCK_POOL_SIZE }, () =>
        new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.98
        }).toDestination()
      );
      this.synth = null;
      return;
    }

    switch (id) {
      case 'grand-piano':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.005, decay: 0.4, sustain: 0.3, release: 2.5 }
        }).toDestination();
        break;

      case 'electric-piano':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 3,
          modulationIndex: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 1.5 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0.0, release: 0.2 }
        }).toDestination();
        break;

      case 'strings':
        this.synth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 2.5,
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.4, decay: 0.3, sustain: 0.8, release: 2 },
          modulation: { type: 'sine' },
          modulationEnvelope: { attack: 0.5, decay: 0.3, sustain: 0.5, release: 1 }
        }).toDestination();
        break;

      case 'brass':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.5 }
        }).toDestination();
        break;

      case 'pure-sine':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.6, release: 1 }
        }).toDestination();
        break;

      case 'organ':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.0, sustain: 1.0, release: 0.1 }
        }).toDestination();
        break;

      case 'bell':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 8,
          modulationIndex: 2,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 1.5, sustain: 0.0, release: 3 },
          modulation: { type: 'sine' },
          modulationEnvelope: { attack: 0.001, decay: 0.5, sustain: 0.0, release: 1 }
        }).toDestination();
        break;

      case 'pad':
        this.synth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.5,
          oscillator: { type: 'fatsine' as any },
          envelope: { attack: 0.8, decay: 0.5, sustain: 0.9, release: 3 },
          modulation: { type: 'sine' },
          modulationEnvelope: { attack: 0.7, decay: 0.5, sustain: 0.8, release: 2 }
        }).toDestination();
        break;

      case 'wobble':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.5,
          modulationIndex: 20,
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.8 },
          modulation: { type: 'sine' },
          modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 }
        }).toDestination();
        break;

      // New 10 Sounds Logic
      case 'drumset':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 0.5,
          modulationIndex: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0.05, release: 0.1 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.1 }
        }).toDestination();
        break;

      case 'hangpad':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.5,
          modulationIndex: 5,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.02, decay: 0.5, sustain: 0.1, release: 2 },
          modulation: { type: 'sine' }
        }).toDestination();
        break;

      case 'winds':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.0,
          modulationIndex: 3,
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.5 },
          modulation: { type: 'sawtooth' }
        }).toDestination();
        break;

      case 'flute':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.15, decay: 0.1, sustain: 0.8, release: 0.5 }
        }).toDestination();
        break;

      case 'cello':
        this.synth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.01,
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.2, decay: 0.3, sustain: 0.9, release: 1 },
          modulation: { type: 'sine' }
        }).toDestination();
        break;

      case 'harpsichord':
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'square' },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 }
        }).toDestination();
        break;

      case 'dream-pad':
        this.synth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 3.01,
          oscillator: { type: 'sine' },
          envelope: { attack: 1.5, decay: 0.5, sustain: 0.9, release: 5 },
          modulation: { type: 'sawtooth' }
        }).toDestination();
        break;

      case 'overdrive':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 1.0,
          modulationIndex: 50,
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 1.0, release: 0.5 },
          modulation: { type: 'sawtooth' }
        }).toDestination();
        break;

      case 'oboe':
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
          harmonicity: 2.0,
          modulationIndex: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.3 },
          modulation: { type: 'square' }
        }).toDestination();
        break;

      case 'accordion':
        this.synth = new Tone.PolySynth(Tone.AMSynth, {
          harmonicity: 1.5,
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.1, decay: 0.1, sustain: 1.0, release: 0.1 },
          modulation: { type: 'triangle' }
        }).toDestination();
        break;

      default:
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.005, decay: 0.4, sustain: 0.3, release: 2.5 }
        }).toDestination();
    }

    if (this.synth) {
      this.synth.volume.value = -6;
    }
  }

  private disposeSynth() {
    try {
      if (this.synth) { this.synth.dispose(); this.synth = null; }
      this.pluckPool.forEach(p => p.dispose());
      this.pluckPool = [];
    } catch { /* ignore */ }
  }

  async ensureContext() {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
  }

  playNote(midiNumber: number, velocity: number = 0.8) {
    this.ensureContext();
    const freq = Tone.Frequency(midiNumber, 'midi').toFrequency();

    if (this.isPluck) {
      const slot = this.pluckPool[this._pluckIdx % this.PLUCK_POOL_SIZE];
      this._pluckIdx = (this._pluckIdx + 1) % this.PLUCK_POOL_SIZE;
      slot.triggerAttack(freq, Tone.now());
      return;
    }

    if (this.synth) {
      try {
        const note = Tone.Frequency(midiNumber, 'midi').toNote();
        this.synth.triggerAttack(note, Tone.now(), velocity);
      } catch { /* ignore */ }
    }
  }

  triggerAttackRelease(midiNumber: number, duration: number, time: any, velocity: number = 0.8) {
    this.ensureContext();
    const freq = Tone.Frequency(midiNumber, 'midi').toFrequency();

    if (this.isPluck) {
      const slot = this.pluckPool[this._pluckIdx % this.PLUCK_POOL_SIZE];
      this._pluckIdx = (this._pluckIdx + 1) % this.PLUCK_POOL_SIZE;
      slot.triggerAttack(freq, time);
      return;
    }

    if (this.synth) {
      try {
        const note = Tone.Frequency(midiNumber, 'midi').toNote();
        this.synth.triggerAttackRelease(note, duration, time, velocity);
      } catch { /* ignore */ }
    }
  }

  private _pluckIdx = 0;

  releaseNote(midiNumber: number) {
    if (this.isPluck) return;
    if (this.synth) {
      try {
        const note = Tone.Frequency(midiNumber, 'midi').toNote();
        this.synth.triggerRelease(note, Tone.now());
      } catch { /* ignore */ }
    }
  }

  releaseAll() {
    if (this.synth) {
      try { this.synth.releaseAll(); } catch { /* ignore */ }
    }
  }
}
