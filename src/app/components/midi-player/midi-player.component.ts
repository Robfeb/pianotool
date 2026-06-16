import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MidiPlayerService } from '../../services/midi-player.service';
import { TheoryService } from '../../services/theory.service';
import { MIDI_SONGS, MIDI_EXERCISES } from '../../midi-index';

@Component({
  selector: 'app-midi-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-panel">
      <h3>{{ theory.language() === 'es' ? 'Reproductor MIDI' : 'MIDI Player' }}</h3>
      
      <div class="upload-zone" (click)="fileInput.click()">
        <input type="file" #fileInput (change)="onFileSelected($event)" accept=".mid,.midi" style="display: none"/>
        @if (midiPlayer.currentFileName()) {
          <p class="loaded-file">🎵 {{ midiPlayer.currentFileName() }}</p>
          <p class="duration">({{ midiPlayer.currentMidi()?.duration | number:'1.1-1' }}s)</p>
        } @else {
          <p>{{ theory.language() === 'es' ? 'Clic para cargar file .mid' : 'Click to load .mid file' }}</p>
        }
      </div>

      <!-- Library Selection -->
      <div class="library-selectors">
        <div class="selector-group">
          <label>{{ theory.language() === 'es' ? 'Canciones Library:' : 'Song Library:' }}</label>
          <select (change)="onSongSelected($event)">
            <option value="">-- {{ theory.language() === 'es' ? 'Seleccionar Canción' : 'Select Song' }} --</option>
            @for (song of songs; track song.path) {
              <option [value]="song.path">{{ song.name }}</option>
            }
          </select>
        </div>

        <div class="selector-group">
          <label>{{ theory.language() === 'es' ? 'Ejercicios Library:' : 'Exercise Library:' }}</label>
          <select (change)="onExerciseSelected($event)">
            <option value="">-- {{ theory.language() === 'es' ? 'Seleccionar Ejercicio' : 'Select Exercise' }} --</option>
            @for (cat of exerciseKeys; track cat) {
              <optgroup [label]="cat">
                @for (sub of getSubKeys(cat); track sub) {
                  @for (ex of getExercises(cat, sub); track ex.path) {
                    <option [value]="ex.path">{{ sub }} - {{ ex.name }}</option>
                  }
                }
              </optgroup>
            }
          </select>
        </div>
      </div>

      <!-- Mode Selector -->
      <div class="mode-selector">
        <button [class.active]="!midiPlayer.isPracticeMode()" (click)="setMode(false)">
          {{ theory.language() === 'es' ? 'Automático' : 'Auto Play' }}
        </button>
        <button [class.active]="midiPlayer.isPracticeMode()" (click)="setMode(true)">
          {{ theory.language() === 'es' ? 'Modo Práctica' : 'Practice Mode' }}
        </button>
      </div>

      @if (!midiPlayer.isPracticeMode()) {
        <div class="controls-row">
          <div class="controls">
            <button [class.active]="midiPlayer.isPlaying()" (click)="togglePlay()">
              {{ midiPlayer.isPlaying() 
                  ? (theory.language() === 'es' ? 'Pausa' : 'Pause') 
                  : (theory.language() === 'es' ? 'Play' : 'Play') }}
            </button>
            <button (click)="stop()">{{ theory.language() === 'es' ? 'Detener' : 'Stop' }}</button>
          </div>

          <div class="speed-control">
            <label>{{ theory.language() === 'es' ? 'Velocidad:' : 'Speed:' }}</label>
            <select (change)="onSpeedChange($event)">
              @for (rate of speedOptions; track rate) {
                <option [value]="rate" [selected]="midiPlayer.playbackRate() === rate">{{ rate }}x</option>
              }
            </select>
          </div>
        </div>
      } @else {
        <div class="practice-info">
          <p>{{ theory.language() === 'es' ? 'Paso:' : 'Step:' }} {{ midiPlayer.currentStepIndex() + 1 }} / {{ midiPlayer.practiceSteps().length }}</p>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="practiceProgress()"></div>
          </div>
          <button (click)="resetPractice()">{{ theory.language() === 'es' ? 'Reiniciar' : 'Reset' }}</button>
        </div>
      }

      <div class="split-hands">
        <h4>{{ theory.language() === 'es' ? 'Selección de Manos' : 'Hand Selection' }}</h4>
        <div class="toggles">
          <button [class.active]="midiPlayer.playLH()" (click)="toggleLH()">
            {{ theory.language() === 'es' ? 'MI (Rosa)' : 'LH (Pink)' }}
          </button>
          <button [class.active]="midiPlayer.playRH()" (click)="toggleRH()">
            {{ theory.language() === 'es' ? 'MD (Verde)' : 'RH (Green)' }}
          </button>
        </div>
        <p class="hint">
          {{ theory.language() === 'es' 
            ? 'En Modo Práctica, el sistema esperará por las teclas de las manos seleccionadas.' 
            : 'In Practice Mode, the system will wait for the keys of selected hands.' }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .player-panel {
      background: var(--panel-bg);
      padding: 16px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-main);
    }
    h3, h4 { color: var(--accent-color); margin-bottom: 8px; font-size: 0.9rem; }
    h4 { font-size: 0.8rem; margin-top: 12px; }
    .upload-zone {
      border: 1px dashed var(--border-color);
      padding: 12px;
      text-align: center;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 12px;
      font-size: 0.8rem;
    }
    .upload-zone:hover { border-color: var(--accent-color); }
    
    .library-selectors {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .selector-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .selector-group label {
      font-size: 0.7rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      font-weight: 600;
    }
    .selector-group select {
      width: 100%;
      padding: 6px;
      font-size: 0.8rem;
    }
    .loaded-file {
      font-weight: 700;
      color: var(--accent-color);
      margin: 0;
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .duration {
      font-size: 0.7rem;
      margin: 2px 0 0 0;
      opacity: 0.8;
    }
    .mode-selector {
      display: flex;
      gap: 1px;
      background: var(--border-color);
      padding: 2px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .mode-selector button {
      flex: 1;
      border-radius: 2px;
      padding: 6px;
      font-size: 0.75rem;
      background: transparent;
    }
    .mode-selector button.active {
      background: var(--accent-color);
      color: white;
    }
    .controls-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 15px;
    }
    .controls, .toggles {
      display: flex;
      gap: 10px;
    }
    .practice-info {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .progress-bar {
      height: 6px;
      background: var(--surface-bg);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent-color);
      transition: width 0.3s ease;
    }
    .hint {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 10px;
      font-style: italic;
    }
    .speed-control {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .speed-control label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    select {
      background: var(--surface-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      padding: 5px;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    button.active {
      background: var(--accent-color);
      color: #fff;
    }
  `]
})
export class MidiPlayerComponent {
  midiPlayer = inject(MidiPlayerService);
  theory = inject(TheoryService);
  
  songs = MIDI_SONGS;
  exercises = MIDI_EXERCISES;
  exerciseKeys = Object.keys(MIDI_EXERCISES);

  readonly speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  practiceProgress = signal(0);

  private exerciseNameMap = new Map<string, string>();

  constructor() {
    for (const cat of this.exerciseKeys) {
      for (const sub of Object.keys(this.exercises[cat])) {
        for (const ex of this.exercises[cat][sub]) {
          this.exerciseNameMap.set(ex.path, `${cat} - ${sub} - ${ex.name}`);
        }
      }
    }

    effect(() => {
      const steps = this.midiPlayer.practiceSteps();
      if (steps.length > 0) {
        this.practiceProgress.set((this.midiPlayer.currentStepIndex() / steps.length) * 100);
      } else {
        this.practiceProgress.set(0);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.midiPlayer.loadFile(file);
    }
  }

  setMode(isPractice: boolean) {
    this.midiPlayer.stop();
    this.midiPlayer.isPracticeMode.set(isPractice);
    if (isPractice) {
      this.midiPlayer.generatePracticeSteps();
    }
  }

  onSpeedChange(event: Event) {
    const rate = +(event.target as HTMLSelectElement).value;
    this.midiPlayer.setPlaybackRate(rate);
  }

  togglePlay() {
    if (this.midiPlayer.isPlaying()) {
      this.midiPlayer.pause();
    } else {
      const midi = this.midiPlayer.currentMidi();
      if (midi) {
        this.midiPlayer.schedulePlayback(midi, this.midiPlayer.playLH(), this.midiPlayer.playRH());
        this.midiPlayer.play();
      }
    }
  }

  stop() {
    this.midiPlayer.stop();
  }

  resetPractice() {
    this.midiPlayer.currentStepIndex.set(0);
  }

  toggleLH() {
    this.midiPlayer.playLH.set(!this.midiPlayer.playLH());
    this.refreshAfterHandChange();
  }

  toggleRH() {
    this.midiPlayer.playRH.set(!this.midiPlayer.playRH());
    this.refreshAfterHandChange();
  }

  private refreshAfterHandChange() {
    if (this.midiPlayer.isPracticeMode()) {
      this.midiPlayer.generatePracticeSteps();
    } else if (this.midiPlayer.isPlaying()) {
      const midi = this.midiPlayer.currentMidi();
      if (midi) {
        this.midiPlayer.schedulePlayback(midi, this.midiPlayer.playLH(), this.midiPlayer.playRH());
      }
    }
  }

  getSubKeys(cat: string): string[] {
    return Object.keys(this.exercises[cat]);
  }

  getExercises(cat: string, sub: string) {
    return this.exercises[cat][sub];
  }

  onSongSelected(event: Event) {
    const path = (event.target as HTMLSelectElement).value;
    if (!path) return;
    const song = this.songs.find(s => s.path === path);
    if (song) {
      this.midiPlayer.loadMidiFromUrl(path, song.name);
    }
  }

  onExerciseSelected(event: Event) {
    const path = (event.target as HTMLSelectElement).value;
    if (!path) return;
    
    const friendlyName = this.exerciseNameMap.get(path) || 'Exercise';
    this.midiPlayer.loadMidiFromUrl(path, friendlyName);
  }
}
