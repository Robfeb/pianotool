import { Injectable, signal, inject, computed } from '@angular/core';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { AudioService } from './audio.service';

export interface ParsedMidiState {
  tracks: any[];
  duration: number;
}

export interface PracticeNote {
  midi: number;
  hand: 'rh' | 'lh';
}

export interface PracticeStep {
  notes: PracticeNote[];
  time: number;
}

@Injectable({
  providedIn: 'root'
})
export class MidiPlayerService {
  private audio = inject(AudioService);
  
  readonly currentMidi = signal<ParsedMidiState | null>(null);
  readonly currentFileName = signal<string | null>(null);
  readonly isPlaying = signal<boolean>(false);
  readonly playbackRate = signal<number>(1.0);
  
  // Interactive Practice State
  readonly isPracticeMode = signal<boolean>(false);
  readonly practiceSteps = signal<PracticeStep[]>([]);
  readonly currentStepIndex = signal<number>(0);
  
  // Filters for both playback and practice
  readonly playLH = signal(true);
  readonly playRH = signal(true);

  // Real-time signals updated during playback for visual sync
  readonly currentlyPlayingNotes = signal<Map<number, string>>(new Map()); // midiNumber -> hand/track context
  
  // Computed target notes for practice mode
  readonly targetNotes = computed(() => {
    const steps = this.practiceSteps();
    const idx = this.currentStepIndex();
    return (this.isPracticeMode() && steps[idx]) ? steps[idx].notes : [];
  });

  private toneParts: Tone.Part[] = [];

  constructor() {}

  async loadFile(file: File) {
    await this.audio.ensureContext();
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && e.target.result) {
        this.currentFileName.set(file.name.replace(/\.[^/.]+$/, ""));
        const midiData = e.target.result as ArrayBuffer;
        const midi = new Midi(midiData);
        
        this.currentMidi.set({
          tracks: midi.tracks,
          duration: midi.duration
        });
        
        this.generatePracticeSteps();
      }
    };
    reader.readAsArrayBuffer(file);
  }

  setPlaybackRate(rate: number) {
    this.playbackRate.set(rate);
    this.toneParts.forEach(part => part.playbackRate = rate);
  }

  generatePracticeSteps() {
    const midi = this.currentMidi();
    if (!midi) return;

    const allNotes: { midi: number, time: number, hand: 'rh' | 'lh' }[] = [];
    
    const activeTracks = midi.tracks.filter(t => t.notes.length > 0);
    const isStandardSplit = activeTracks.length !== 2;

    midi.tracks.forEach((track, index) => {
      track.notes.forEach((n: any) => {
        let hand: 'rh' | 'lh' = 'rh';
        
        if (isStandardSplit) {
          hand = n.midi >= 60 ? 'rh' : 'lh';
        } else {
          const trackIdx = activeTracks.indexOf(track);
          hand = trackIdx === 0 ? 'rh' : 'lh';
        }

        if (hand === 'lh' && !this.playLH()) return;
        if (hand === 'rh' && !this.playRH()) return;

        allNotes.push({ midi: n.midi, time: n.time, hand });
      });
    });

    // Sort by time, then by pitch (sequential notes)
    allNotes.sort((a, b) => {
       if (a.time !== b.time) return a.time - b.time;
       return a.midi - b.midi;
    });

    // No chord grouping! Each note is its own step.
    const steps: PracticeStep[] = allNotes.map(note => ({
       time: note.time,
       notes: [{ midi: note.midi, hand: note.hand }]
    }));

    this.practiceSteps.set(steps);
    this.currentStepIndex.set(0);
  }

  onUserNotePress(midi: number) {
    if (!this.isPracticeMode()) return;

    const target = this.targetNotes();
    if (target.length === 0) return;

    // Strict sequential match
    const match = target.find(n => n.midi === midi);
    
    if (match) {
      // We no longer call playNote here because the keyboard/midi-api drivers 
      // handle direct audio with Note On/Off sustain logic.
      
      this.updateVisualNote(midi, match.hand, true);
      setTimeout(() => this.updateVisualNote(midi, match.hand, false), 200);

      this.advancePractice();
    }
  }

  advancePractice() {
    const nextIdx = this.currentStepIndex() + 1;
    if (nextIdx < this.practiceSteps().length) {
      this.currentStepIndex.set(nextIdx);
    } else {
      this.currentStepIndex.set(0); 
    }
  }

  schedulePlayback(midi: ParsedMidiState, playLeftHand: boolean = true, playRightHand: boolean = true) {
    this.clearPlayback();
    Tone.getTransport().seconds = 0;

    const activeTracks = midi.tracks.filter(t => t.notes.length > 0);
    const isStandardSplit = activeTracks.length !== 2;

    activeTracks.forEach((track, index) => {
      const part = new Tone.Part((time, note) => {
        let hand: 'rh' | 'lh' = 'rh';
        if (isStandardSplit) {
          hand = note.midi >= 60 ? 'rh' : 'lh';
        } else {
          hand = index === 0 ? 'rh' : 'lh';
        }

        if (hand === 'lh' && !playLeftHand) return;
        if (hand === 'rh' && !playRightHand) return;

        this.audio.triggerAttackRelease(note.midi, note.duration, time, note.velocity);
        
        Tone.Draw.schedule(() => {
          this.updateVisualNote(note.midi, hand, true);
        }, time);

        Tone.Draw.schedule(() => {
          this.updateVisualNote(note.midi, hand, false);
        }, time + note.duration);

      }, track.notes.map((n: any) => ({
        time: n.time,
        note: n.name,
        midi: n.midi,
        duration: n.duration,
        velocity: n.velocity
      })));

      part.playbackRate = this.playbackRate();
      part.start(0);
      this.toneParts.push(part);
    });
  }

  private updateVisualNote(midi: number, hand: string, isOn: boolean) {
    const map = new Map(this.currentlyPlayingNotes());
    if (isOn) {
      map.set(midi, hand);
    } else {
      map.delete(midi);
    }
    this.currentlyPlayingNotes.set(map);
  }

  async play() {
    await this.audio.ensureContext();
    if (this.isPlaying()) return; 
    Tone.getTransport().start("+0.1");
    this.isPlaying.set(true);
  }

  pause() {
    Tone.getTransport().pause();
    this.isPlaying.set(false);
  }

  stop() {
    Tone.getTransport().stop();
    Tone.getTransport().seconds = 0;
    this.isPlaying.set(false);
    this.currentStepIndex.set(0);
    this.currentlyPlayingNotes.set(new Map());
  }

  clearPlayback() {
    Tone.getTransport().stop();
    Tone.getTransport().cancel(0);
    this.toneParts.forEach(p => p.dispose());
    this.toneParts = [];
  }

  async loadMidiFromUrl(url: string, name: string) {
    this.stop();
    this.audio.ensureContext();
    
    try {
      const resp = await fetch(url);
      const midiData = await resp.arrayBuffer();
      const midi = new Midi(midiData);
      
      this.currentFileName.set(name);
      this.currentMidi.set({
        tracks: midi.tracks,
        duration: midi.duration
      });
      
      this.generatePracticeSteps();
    } catch (err) {
      console.error('Error loading MIDI from URL:', err);
    }
  }
}
