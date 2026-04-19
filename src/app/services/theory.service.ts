import { Injectable, signal, computed, effect } from '@angular/core';

export interface ChordNote {
  noteName: string; 
  octave: number; 
  midiNumber: number; 
  interval: string; 
}

export interface ChordDefinition {
  id: string;
  nameEn: string;
  nameEs: string;
  formula: number[];
  intervalsEn: string[];
  intervalsEs: string[];
}

export type Language = 'en' | 'es';
export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class TheoryService {
  private readonly NOTE_NAMES_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private readonly NOTE_NAMES_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

  readonly CHORD_DEFINITIONS: ChordDefinition[] = [
    { id: 'maj',    nameEn: 'Major',         nameEs: 'Mayor',      formula: [0, 4, 7],     intervalsEn: ['Root', 'M3', 'P5'],     intervalsEs: ['Tónica', '3M', '5P'] },
    { id: 'min',    nameEn: 'Minor',         nameEs: 'Menor',      formula: [0, 3, 7],     intervalsEn: ['Root', 'm3', 'P5'],     intervalsEs: ['Tónica', '3m', '5P'] },
    { id: 'dim',    nameEn: 'Diminished',    nameEs: 'Disminuido', formula: [0, 3, 6],     intervalsEn: ['Root', 'm3', 'd5'],     intervalsEs: ['Tónica', '3m', '5d'] },
    { id: 'aug',    nameEn: 'Augmented',     nameEs: 'Aumentado',  formula: [0, 4, 8],     intervalsEn: ['Root', 'M3', 'A5'],     intervalsEs: ['Tónica', '3M', '5A'] },
    { id: 'dom7',   nameEn: 'Dominant 7',    nameEs: 'Séptima',    formula: [0, 4, 7, 10], intervalsEn: ['Root', 'M3', 'P5', 'm7'], intervalsEs: ['Tónica', '3M', '5P', '7m'] },
    { id: 'maj7',   nameEn: 'Major 7',       nameEs: 'Maj7',       formula: [0, 4, 7, 11], intervalsEn: ['Root', 'M3', 'P5', 'M7'], intervalsEs: ['Tónica', '3M', '5P', '7M'] },
    { id: 'min7',   nameEn: 'Minor 7',       nameEs: 'Menor 7',    formula: [0, 3, 7, 10], intervalsEn: ['Root', 'm3', 'P5', 'm7'], intervalsEs: ['Tónica', '3m', '5P', '7m'] },
    { id: 'm7b5',   nameEn: 'm7b5',          nameEs: 'm7b5',       formula: [0, 3, 6, 10], intervalsEn: ['Root', 'm3', 'd5', 'm7'], intervalsEs: ['Tónica', '3m', '5d', '7m'] },
    { id: 'dim7',   nameEn: 'Diminished 7',  nameEs: 'Disminuido 7', formula: [0, 3, 6, 9],  intervalsEn: ['Root', 'm3', 'd5', 'd7'], intervalsEs: ['Tónica', '3m', '5d', '7d'] },
    { id: 'sus2',   nameEn: 'Suspended 2',   nameEs: 'Sus2',       formula: [0, 2, 7],     intervalsEn: ['Root', 'M2', 'P5'],     intervalsEs: ['Tónica', '2M', '5P'] },
    { id: 'sus4',   nameEn: 'Suspended 4',   nameEs: 'Sus4',       formula: [0, 5, 7],     intervalsEn: ['Root', 'P4', 'P5'],     intervalsEs: ['Tónica', '4P', '5P'] },
    { id: 'add9',   nameEn: 'Add 9',         nameEs: 'Add 9',      formula: [0, 4, 7, 14], intervalsEn: ['Root', 'M3', 'P5', 'M9'], intervalsEs: ['Tónica', '3M', '5P', '9M'] },
    { id: 'maj6',   nameEn: 'Major 6',       nameEs: 'Sexta Mayor',formula: [0, 4, 7, 9],  intervalsEn: ['Root', 'M3', 'P5', 'M6'], intervalsEs: ['Tónica', '3M', '5P', '6M'] },
    { id: 'min6',   nameEn: 'Minor 6',       nameEs: 'Sexta Menor',formula: [0, 3, 7, 9],  intervalsEn: ['Root', 'm3', 'P5', 'M6'], intervalsEs: ['Tónica', '3m', '5P', '6M'] },
  ];

  readonly NOTE_COLORS: string[] = [
    '#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#e91e63', '#c0392b'
  ];

  // Language
  readonly language = signal<Language>(this.loadPref('language', 'en'));
  
  // Selection State
  readonly selectedRootIndex = signal<number>(0); 
  readonly selectedChordId = signal<string>('maj');
  readonly showOnPiano = signal<boolean>(this.loadPref('showOnPiano', false));

  // UI Visibility Section Toggles (Default Hidden)
  readonly showTheorySection = signal<boolean>(this.loadPref('showTheorySection', false));
  readonly showMidiSection = signal<boolean>(this.loadPref('showMidiSection', false));
  readonly showMetronomeSection = signal<boolean>(this.loadPref('showMetronomeSection', false));
  readonly showHelpSection = signal<boolean>(this.loadPref('showHelpSection', false));
  
  // Theming (Default Dark)
  readonly theme = signal<Theme>(this.loadPref('theme', 'dark'));

  readonly activeTheoryNotes = computed(() => {
    if (!this.showOnPiano()) return [];
    const rootMidi = 60 + this.selectedRootIndex(); 
    const def = this.CHORD_DEFINITIONS.find(d => d.id === this.selectedChordId());
    if (!def) return [];
    return def.formula.map(interval => rootMidi + interval);
  });

  constructor() {
    // Persistence effect
    effect(() => {
      this.savePref('language', this.language());
      this.savePref('showTheorySection', this.showTheorySection());
      this.savePref('showMidiSection', this.showMidiSection());
      this.savePref('showMetronomeSection', this.showMetronomeSection());
      this.savePref('showHelpSection', this.showHelpSection());
      this.savePref('showOnPiano', this.showOnPiano());
      this.savePref('theme', this.theme());
    });
  }

  toggleLanguage() {
    this.language.set(this.language() === 'en' ? 'es' : 'en');
  }

  toggleTheme() {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  getNoteName(midiNumber: number): string {
    const idx = midiNumber % 12;
    return this.language() === 'es' ? this.NOTE_NAMES_ES[idx] : this.NOTE_NAMES_EN[idx];
  }

  getNoteColor(midiNumber: number): string {
    return this.NOTE_COLORS[midiNumber % 12];
  }

  getOctave(midiNumber: number): number {
    return Math.floor(midiNumber / 12) - 1;
  }

  getChordNames(rootIdx: number, lang: Language): { rootName: string, chordName: string } {
    const rootName = lang === 'es' ? this.NOTE_NAMES_ES[rootIdx] : this.NOTE_NAMES_EN[rootIdx];
    const def = this.CHORD_DEFINITIONS.find(d => d.id === this.selectedChordId());
    const typeLabel = lang === 'es' ? def?.nameEs : def?.nameEn;
    return { rootName, chordName: `${rootName} ${typeLabel}` };
  }

  getNoteLibrary(lang: Language) {
    return lang === 'es' ? this.NOTE_NAMES_ES : this.NOTE_NAMES_EN;
  }

  // Persistence helpers
  private savePref(key: string, value: any) {
    localStorage.setItem(`piano_tool_${key}`, JSON.stringify(value));
  }

  private loadPref<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(`piano_tool_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  readonly progressions = [
    { name: 'I-V-vi-IV (C)', roots: [60, 67, 69, 65], types: ['Major', 'Major', 'Minor', 'Major'] },
    { name: 'ii-V-I (C)', roots: [62, 67, 60], types: ['Minor', 'Major', 'Major'] },
    { name: '12-Bar Blues (C)', roots: [60, 65, 60, 67, 65, 60], types: ['Dominant 7', 'Dominant 7', 'Dominant 7', 'Dominant 7', 'Dominant 7', 'Dominant 7'] }
  ];
}
