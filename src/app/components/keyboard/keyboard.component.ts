import { Component, computed, inject, signal, effect, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, SOUND_PRESETS } from '../../services/audio.service';
import { MidiApiService } from '../../services/midi-api.service';
import { MidiPlayerService } from '../../services/midi-player.service';
import { TheoryService } from '../../services/theory.service';

interface KeyConfig {
  midi: number;
  noteName: string;
  isBlack: boolean;
  xOffset: number;
}

// White key assignments (a,s,d,f,g,h,j,k,l,ñ) — user-specified (h kept as bridge)
const WHITE_KEY_BINDINGS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'];
// Black key assignments (w,e,t,y,u,o,p)
const BLACK_KEY_BINDINGS = ['w', 'e', 't', 'y', 'u', 'o', 'p'];

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="keyboard-container">
      <!-- Controls Row 1: Size, Language, Note Toggles -->
      <div class="controls">
        <div class="ctrl-group">
          <label>{{ theory.language() === 'es' ? 'Teclado:' : 'Keyboard:' }}</label>
          <select (change)="changeSize($event)">
            <option value="88" [selected]="keyboardSize() === 88">88 {{ theory.language() === 'es' ? 'teclas' : 'keys' }}</option>
            <option value="76" [selected]="keyboardSize() === 76">76 {{ theory.language() === 'es' ? 'teclas' : 'keys' }}</option>
            <option value="61" [selected]="keyboardSize() === 61">61 {{ theory.language() === 'es' ? 'teclas' : 'keys' }}</option>
            <option value="49" [selected]="keyboardSize() === 49">49 {{ theory.language() === 'es' ? 'teclas' : 'keys' }}</option>
            <option value="25" [selected]="keyboardSize() === 25">25 {{ theory.language() === 'es' ? 'teclas' : 'keys' }}</option>
          </select>
        </div>

        <div class="ctrl-group">
          <label>{{ theory.language() === 'es' ? 'Idioma:' : 'Language:' }}</label>
          <button class="lang-btn" (click)="toggleLanguage()">
            {{ theory.language() === 'en' ? '🇬🇧 EN' : '🇪🇸 ES' }}
          </button>
        </div>

        <div class="ctrl-group">
          <label>
            <input type="checkbox" [checked]="showNotes()" (change)="toggleNotes()" />
            {{ theory.language() === 'es' ? 'Mostrar Notas' : 'Show Notes' }}
          </label>
        </div>

        @if (showNotes()) {
          <div class="ctrl-group">
            <label>
              <input type="checkbox" [checked]="colorizeNotes()" (change)="toggleColorize()" />
              {{ theory.language() === 'es' ? 'Colorear Notas' : 'Colorize Notes' }}
            </label>
          </div>
        }

        <div class="ctrl-group">
          <label>{{ theory.language() === 'es' ? 'Sonido:' : 'Sound:' }}</label>
          <select (change)="changeSound($event)">
            @for (p of soundPresets; track p.id) {
              <option [value]="p.id" [selected]="audio.selectedPreset() === p.id">
                {{ theory.language() === 'es' ? p.labelEs : p.label }}
              </option>
            }
          </select>
        </div>
      </div>

      <!-- Controls Row 2: PC keyboard range selector -->
      <div class="controls controls-secondary">
        <div class="ctrl-group">
          <label>{{ theory.language() === 'es' ? 'Asignación teclado PC — Octava inicio:' : 'PC Keyboard mapping — Start octave:' }}</label>
          <select (change)="changePcOctave($event)">
            @for (oct of octaveOptions; track oct) {
              <option [value]="oct" [selected]="pcOctave() === oct">C{{ oct }}</option>
            }
          </select>
        </div>
        <div class="key-legend">
          <span class="legend-white">⬜ {{ theory.language() === 'es' ? 'Blancas' : 'White' }}: A S D F G H J K L Ñ</span>
          <span class="legend-black">⬛ {{ theory.language() === 'es' ? 'Negras' : 'Black' }}: W E T Y U O P</span>
          <span class="legend-ctrl">⌨️ Z/X: {{ theory.language() === 'es' ? 'Octava' : 'Octave' }}</span>
          <span class="legend-ctrl">🎶 C/V: {{ theory.language() === 'es' ? 'Sonido' : 'Sound' }}</span>
        </div>
      </div>

      <!-- Controls Row 3: Viewport Slider -->
      <div class="controls controls-slider">
        <label>{{ theory.language() === 'es' ? 'Rango de vista:' : 'View range:' }}</label>
        <input type="range" class="viewport-slider" [min]="0" [max]="maxScroll()" [value]="scrollOffset()" (input)="onScroll($event)"/>
      </div>

      <!-- SVG Piano Keyboard -->
      <div class="svg-container" (mouseleave)="releaseAllLocalNotes()">
        <svg [attr.width]="totalWidth()" height="240" [attr.viewBox]="viewBox()">
          <!-- Glow filter for PC-bound keys -->
          <defs>
            <filter id="key-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>


          <!-- White Keys -->
          <g>
            @for (key of whiteKeys(); track key.midi) {
              <g>
                <rect
                  [attr.x]="key.xOffset"
                  y="0"
                  [attr.width]="whiteKeyWidth"
                  height="230"
                  [attr.fill]="getKeyFill(key)"
                  [attr.stroke]="hasPcBinding(key.midi) ? '#4facfe' : '#444'"
                  [attr.stroke-width]="hasPcBinding(key.midi) ? '2' : '1'"
                  [attr.filter]="hasPcBinding(key.midi) ? 'url(#key-glow)' : null"
                  rx="3"
                  (mousedown)="playNote(key.midi)"
                  (mouseup)="releaseNote(key.midi)"
                  (mouseleave)="releaseNote(key.midi)"
                />
                @if (showNotes()) {
                  <text
                    [attr.x]="key.xOffset + whiteKeyWidth / 2"
                    y="212"
                    text-anchor="middle"
                    [attr.fill]="colorizeNotes() ? theory.getNoteColor(key.midi) : '#333'"
                    font-size="11"
                    font-weight="600"
                    font-family="Inter, sans-serif"
                    pointer-events="none"
                  >{{ key.noteName }}</text>
                }
                <!-- PC key binding hint -->
                @if (getPcKeyHint(key.midi); as hint) {
                  <text
                    [attr.x]="key.xOffset + whiteKeyWidth / 2"
                    y="198"
                    text-anchor="middle"
                    fill="#aaa"
                    font-size="9"
                    font-family="monospace"
                    pointer-events="none"
                  >{{ hint }}</text>
                }
              </g>
            }
          </g>

          <!-- Black Keys -->
          <g>
            @for (key of blackKeys(); track key.midi) {
              <g>
                <rect
                  [attr.x]="key.xOffset"
                  y="0"
                  [attr.width]="blackKeyWidth"
                  height="150"
                  [attr.fill]="getKeyFill(key)"
                  [attr.stroke]="hasPcBinding(key.midi) ? '#4facfe' : 'none'"
                  [attr.stroke-width]="hasPcBinding(key.midi) ? '2' : '0'"
                  [attr.filter]="hasPcBinding(key.midi) ? 'url(#key-glow)' : null"
                  rx="3"
                  (mousedown)="playNote(key.midi)"
                  (mouseup)="releaseNote(key.midi)"
                  (mouseleave)="releaseNote(key.midi)"
                />
                @if (showNotes()) {
                  <text
                    [attr.x]="key.xOffset + blackKeyWidth / 2"
                    y="132"
                    text-anchor="middle"
                    [attr.fill]="colorizeNotes() ? '#fff' : '#eee'"
                    font-size="9"
                    font-weight="600"
                    font-family="Inter, sans-serif"
                    pointer-events="none"
                  >{{ key.noteName }}</text>
                }
                <!-- PC key binding hint -->
                @if (getPcKeyHint(key.midi); as hint) {
                  <text
                    [attr.x]="key.xOffset + blackKeyWidth / 2"
                    y="118"
                    text-anchor="middle"
                    fill="#aaa"
                    font-size="9"
                    font-family="monospace"
                    pointer-events="none"
                  >{{ hint }}</text>
                }
              </g>
            }
          </g>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .keyboard-container {
      width: 100%;
      background: var(--panel-bg);
      padding: 20px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-main);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
    }
    .controls-secondary {
      padding: 8px 12px;
      background: var(--surface-bg);
      border-radius: 6px;
      border: 1px solid var(--border-color);
    }
    .controls-slider {
      gap: 10px;
    }
    .ctrl-group {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }
    label {
      color: var(--text-secondary);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    select {
      background: var(--surface-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      padding: 5px 10px;
      border-radius: 4px;
      font-family: inherit;
    }
    input[type="checkbox"] {
      accent-color: var(--accent-color);
      width: 14px;
      height: 14px;
    }
    .lang-btn {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .lang-btn:hover {
      background: var(--accent-color);
      color: #fff;
    }
    .key-legend {
      display: flex;
      gap: 16px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .legend-white { color: #ccc; }
    .legend-black { color: #888; }
    .legend-ctrl { color: var(--accent-color); font-weight: 500; }
    .viewport-slider {
      flex: 1;
      min-width: 200px;
    }
    .svg-container {
      width: 100%;
      overflow: hidden;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      user-select: none;
    }
    rect {
      cursor: pointer;
      transition: fill 0.08s;
    }
  `]
})
export class KeyboardComponent implements OnDestroy {
  audio = inject(AudioService);
  midiApi = inject(MidiApiService);
  midiPlayer = inject(MidiPlayerService);
  theory = inject(TheoryService);

  readonly whiteKeyWidth = 40;
  readonly blackKeyWidth = 24;
  readonly octaveOptions = [2, 3, 4, 5, 6];
  readonly MIN_OCTAVE = 2;
  readonly MAX_OCTAVE = 6;
  readonly soundPresets = SOUND_PRESETS;

  // ─── Persistent State (localStorage) ──────────────────────────────
  private readonly LS_KEY = 'piano-tool-prefs';

  private loadPref<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (!raw) return fallback;
      const obj = JSON.parse(raw);
      return key in obj ? obj[key] : fallback;
    } catch { return fallback; }
  }

  private savePrefs() {
    try {
      localStorage.setItem(this.LS_KEY, JSON.stringify({
        keyboardSize: this.keyboardSize(),
        scrollOffset: this.scrollOffset(),
        showNotes: this.showNotes(),
        colorizeNotes: this.colorizeNotes(),
        pcOctave: this.pcOctave(),
        language: this.theory.language(),
        selectedSound: this.audio.selectedPreset()
      }));
    } catch { /* ignore quota errors */ }
  }

  // ─── UI State (initialised from localStorage, defaults: 49 keys, C3) ─
  keyboardSize  = signal<number>(this.loadPref('keyboardSize',  49));
  scrollOffset  = signal<number>(this.loadPref('scrollOffset',  0));
  showNotes     = signal<boolean>(this.loadPref('showNotes',    false));
  colorizeNotes = signal<boolean>(this.loadPref('colorizeNotes', false));
  pcOctave      = signal<number>(this.loadPref('pcOctave',      3));

  // Keys currently pressed locally (mouse or PC keyboard) — midiNumber
  localNotes = signal<Set<number>>(new Set());

  private previouslyActiveMidi = new Set<number>();

  constructor() {
    this.restorePrefs();

    // Pipe MIDI hardware notes to practice mode (Note On only)
    effect(() => {
      const activeMidi = this.midiApi.activeMidiNotes(); // Map<midi, velocity>
      
      activeMidi.forEach((_velocity, midi) => {
        if (!this.previouslyActiveMidi.has(midi)) {
          this.midiPlayer.onUserNotePress(midi);
        }
      });

      // Synchronize previouslyActiveMidi set
      this.previouslyActiveMidi = new Set(activeMidi.keys());
    });
  }

  private restorePrefs() {
    // Restore language from localStorage
    const savedLang = this.loadPref<string>('language', 'en');
    if (savedLang === 'es') this.theory.language.set('es');

    // Restore sound from localStorage
    const savedSound = this.loadPref<string>('selectedSound', 'grand-piano');
    this.audio.switchPreset(savedSound);
  }

  // ─── Build the piano key layout ──────────────────────────────────
  keysConfig = computed(() => {
    const size = this.keyboardSize();
    let startMidi = 21, endMidi = 108;
    if (size === 76) { startMidi = 28; endMidi = 103; }
    if (size === 61) { startMidi = 36; endMidi = 96; }
    if (size === 49) { startMidi = 36; endMidi = 84; }
    if (size === 25) { startMidi = 48; endMidi = 72; }

    const keys: KeyConfig[] = [];
    let currentX = 0;

    for (let i = startMidi; i <= endMidi; i++) {
      const noteInOctave = i % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);
      const name = this.theory.getNoteName(i);

      if (!isBlack) {
        keys.push({ midi: i, noteName: name, isBlack, xOffset: currentX });
        currentX += this.whiteKeyWidth;
      } else {
        keys.push({ midi: i, noteName: name, isBlack, xOffset: currentX - this.blackKeyWidth / 2 });
      }
    }
    return keys;
  });

  whiteKeys   = computed(() => this.keysConfig().filter(k => !k.isBlack));
  blackKeys   = computed(() => this.keysConfig().filter(k => k.isBlack));
  totalWidth  = computed(() => this.whiteKeys().length * this.whiteKeyWidth);
  maxScroll   = computed(() => Math.max(0, this.totalWidth() - 900));
  viewBox     = computed(() => `${this.scrollOffset()} 0 900 240`);

  // ─── PC keyboard → MIDI mapping ──────────────────────────────────
  pcKeyMap = computed(() => {
    const map = new Map<string, number>();
    const rootC = (this.pcOctave() + 1) * 12;

    const whiteOffsets = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
    WHITE_KEY_BINDINGS.forEach((key, i) => {
      if (i < whiteOffsets.length) map.set(key, rootC + whiteOffsets[i]);
    });
    const blackOffsets = [1, 3, 6, 8, 10, 13, 15, 18, 20];
    BLACK_KEY_BINDINGS.forEach((key, i) => {
      if (i < blackOffsets.length) map.set(key, rootC + blackOffsets[i]);
    });
    return map;
  });

  pcKeyHintMap = computed(() => {
    const reverse = new Map<number, string>();
    this.pcKeyMap().forEach((midi, key) => reverse.set(midi, key.toUpperCase()));
    return reverse;
  });

  getPcKeyHint(midi: number): string | null {
    return this.pcKeyHintMap().get(midi) ?? null;
  }

  hasPcBinding(midi: number): boolean {
    return this.pcKeyHintMap().has(midi);
  }

  // ─── PC Keyboard Listeners ────────────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.target as Element).tagName === 'INPUT' || (event.target as Element).tagName === 'SELECT') return;
    if (event.repeat) return;

    const key = event.key.toLowerCase();

    // Octave shift: Z = down, X = up
    if (key === 'z') {
      event.preventDefault();
      this.shiftOctave(-1);
      return;
    }
    if (key === 'x') {
      event.preventDefault();
      this.shiftOctave(1);
      return;
    }

    // Sound shift: C = previous, V = next
    if (key === 'c') {
      event.preventDefault();
      this.shiftSound(-1);
      return;
    }
    if (key === 'v') {
      event.preventDefault();
      this.shiftSound(1);
      return;
    }

    const midi = this.pcKeyMap().get(key);
    if (midi !== undefined) {
      event.preventDefault();
      const current = new Set(this.localNotes());
      if (!current.has(midi)) {
        current.add(midi);
        this.localNotes.set(current);
        this.audio.playNote(midi);
        // Pipe to practice mode
        this.midiPlayer.onUserNotePress(midi);
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (['z', 'x', 'c', 'v'].includes(key)) return;

    const midi = this.pcKeyMap().get(key);
    if (midi !== undefined) {
      event.preventDefault();
      const current = new Set(this.localNotes());
      current.delete(midi);
      this.localNotes.set(current);
      this.audio.releaseNote(midi);
    }
  }

  // ─── Mouse Handlers ───────────────────────────────────────────────
  playNote(midi: number) {
    this.audio.playNote(midi);
    this.midiPlayer.onUserNotePress(midi);
    
    const set = new Set(this.localNotes());
    set.add(midi);
    this.localNotes.set(set);
  }

  releaseNote(midi: number) {
    if (!this.localNotes().has(midi)) return;
    this.audio.releaseNote(midi);
    const set = new Set(this.localNotes());
    set.delete(midi);
    this.localNotes.set(set);
  }

  releaseAllLocalNotes() {
    this.localNotes().forEach(midi => this.audio.releaseNote(midi));
    this.localNotes.set(new Set());
  }

  // ─── Visual Color Logic ───────────────────────────────────────────
  getKeyFill(key: KeyConfig): string {
    const isActive = this.localNotes().has(key.midi)
      || this.midiApi.activeMidiNotes().has(key.midi);
    const playerHand = this.midiPlayer.currentlyPlayingNotes().get(key.midi);
    const target = this.midiPlayer.targetNotes().find(n => n.midi === key.midi);
    const isTheory = this.theory.activeTheoryNotes().includes(key.midi);

    if (playerHand === 'rh') return isActive ? '#66ffbb' : 'var(--color-rh)';
    if (playerHand === 'lh') return isActive ? '#ff77aa' : 'var(--color-lh)';

    if (target) {
      if (isActive) return target.hand === 'rh' ? '#66ffbb' : '#ff77aa';
      return target.hand === 'rh' ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 0, 85, 0.5)';
    }

    if (isActive) {
      return this.colorizeNotes()
        ? this.theory.getNoteColor(key.midi)
        : 'var(--accent-color)';
    }

    if (isTheory) {
      return '#f39c12'; // Gold/Sun highlight
    }

    if (this.showNotes() && this.colorizeNotes()) {
      const base = this.theory.getNoteColor(key.midi);
      return key.isBlack ? base + '66' : base + '44';
    }

    return key.isBlack ? 'var(--key-black)' : 'var(--key-white)';
  }

  // ─── Controls ─────────────────────────────────────────────────────
  shiftOctave(delta: number) {
    const next = Math.min(this.MAX_OCTAVE, Math.max(this.MIN_OCTAVE, this.pcOctave() + delta));
    if (next !== this.pcOctave()) {
      this.releaseAllLocalNotes();
      this.pcOctave.set(next);
      this.savePrefs();
    }
  }

  shiftSound(delta: number) {
    const presets = SOUND_PRESETS;
    const currentId = this.audio.selectedPreset();
    const currentIndex = presets.findIndex(p => p.id === currentId);
    let nextIndex = (currentIndex + delta) % presets.length;
    if (nextIndex < 0) nextIndex = presets.length - 1;
    
    this.audio.switchPreset(presets[nextIndex].id);
    this.savePrefs();
  }

  changeSize(event: Event) {
    this.releaseAllLocalNotes();
    this.keyboardSize.set(+(event.target as HTMLSelectElement).value);
    this.scrollOffset.set(0);
    this.savePrefs();
  }

  changePcOctave(event: Event) {
    this.releaseAllLocalNotes();
    this.pcOctave.set(+(event.target as HTMLSelectElement).value);
    this.savePrefs();
  }

  changeSound(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.audio.switchPreset(id);
    this.savePrefs();
  }

  onScroll(event: Event) {
    this.scrollOffset.set(+(event.target as HTMLInputElement).value);
    this.savePrefs();
  }

  toggleNotes() {
    const next = !this.showNotes();
    this.showNotes.set(next);
    if (!next) this.colorizeNotes.set(false);
    this.savePrefs();
  }

  toggleColorize() {
    this.colorizeNotes.set(!this.colorizeNotes());
    this.savePrefs();
  }

  toggleLanguage() {
    this.releaseAllLocalNotes();
    this.theory.toggleLanguage();
    this.savePrefs();
  }


  ngOnDestroy() {
    this.releaseAllLocalNotes();
  }
}
