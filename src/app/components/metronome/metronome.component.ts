import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetronomeService } from '../../services/metronome.service';
import { TheoryService } from '../../services/theory.service';

@Component({
  selector: 'app-metronome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metronome-panel">
      <div class="header">
        <h3>{{ theory.language() === 'es' ? 'Metrónomo' : 'Metronome' }}</h3>
        <button class="play-btn" [class.playing]="metronome.isPlaying()" (click)="metronome.toggle()">
          @if (metronome.isPlaying()) {
            ⏹️
          } @else {
            ▶️
          }
        </button>
      </div>

      <div class="beat-visualizer">
        @for (i of [].constructor(metronome.beatsPerMeasure()); track $index) {
          <div class="beat-dot" 
               [class.active]="metronome.currentBeatIndex() === $index"
               [class.accent]="$index === 0">
          </div>
        }
      </div>

      <div class="bpm-controls">
        <label>{{ theory.language() === 'es' ? 'Tempo (BPM)' : 'Tempo (BPM)' }}</label>
        <div class="bpm-input-wrap">
          <button (click)="adjustBpm(-1)">-</button>
          <input type="number" 
                 [value]="metronome.bpm()" 
                 (change)="onBpmInput($event)"
                 min="40" max="240">
          <button (click)="adjustBpm(1)">+</button>
        </div>
      </div>

      <div class="presets-grid">
        @for (p of [60, 80, 100, 120]; track p) {
          <button class="preset-btn" 
                  [class.active]="metronome.bpm() === p"
                  (click)="metronome.setBpm(p)">
            {{ p }}
          </button>
        }
      </div>

      <div class="settings-row">
        <div class="setting-item">
          <label>{{ theory.language() === 'es' ? 'Acento' : 'Accent' }}</label>
          <label class="switch">
            <input type="checkbox" [checked]="metronome.accentEnabled()" (change)="toggleAccent()">
            <span class="slider round"></span>
          </label>
        </div>

        <div class="setting-item">
          <label>{{ theory.language() === 'es' ? 'Compás' : 'Beats' }}</label>
          <div class="beat-selector">
            @for (b of [2, 3, 4]; track b) {
              <button [class.active]="metronome.beatsPerMeasure() === b"
                      (click)="metronome.beatsPerMeasure.set(b)">
                {{ b }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metronome-panel {
      background: var(--panel-bg);
      padding: 12px 16px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-main);
      display: flex;
      flex-direction: column;
      gap: 12px;
      border: 1px solid var(--border-color);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .beat-visualizer {
      display: flex;
      gap: 8px;
      justify-content: center;
      padding: 8px;
      background: var(--surface-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .beat-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--border-color);
      transition: transform 0.1s;
    }

    .beat-dot.active {
      transform: scale(1.3);
      box-shadow: 0 0 10px var(--accent-color);
      background: var(--accent-color);
    }

    .beat-dot.active.accent {
      box-shadow: 0 0 15px #e74c3c;
      background: #e74c3c;
    }

    h3 {
      color: var(--accent-color);
      margin: 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .play-btn {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .play-btn.playing {
      border-color: var(--accent-color);
      background: rgba(243, 156, 18, 0.1);
    }

    .bpm-controls {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .bpm-controls label {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
    }

    .bpm-input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bpm-input-wrap input {
      background: var(--surface-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      width: 60px;
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      font-size: 1rem;
      font-weight: 700;
    }

    .bpm-input-wrap button {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .presets-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }

    .preset-btn {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .preset-btn.active {
      background: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }

    .settings-row {
      display: flex;
      gap: 16px;
      padding-top: 8px;
      border-top: 1px solid var(--border-color);
    }

    .setting-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .setting-item label {
      font-size: 0.65rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      font-weight: 600;
    }

    .beat-selector {
      display: flex;
      background: var(--surface-bg);
      padding: 2px;
      border-radius: 4px;
      gap: 2px;
    }
    .beat-selector button {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.75rem;
      padding: 4px;
      border-radius: 2px;
      cursor: pointer;
    }
    .beat-selector button.active {
      background: var(--accent-color);
      color: white;
    }

    .switch { position: relative; display: inline-block; width: 28px; height: 14px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .3s; }
    .slider:before { position: absolute; content: ""; height: 10px; width: 10px; left: 2px; bottom: 2px; background-color: white; transition: .3s; }
    input:checked + .slider { background-color: var(--accent-color); }
    input:checked + .slider:before { transform: translateX(14px); }
    .slider.round { border-radius: 14px; }
    .slider.round:before { border-radius: 50%; }
  `]
})
export class MetronomeComponent {
  metronome = inject(MetronomeService);
  theory = inject(TheoryService);

  onBpmInput(event: Event) {
    const val = +(event.target as HTMLInputElement).value;
    this.metronome.setBpm(val);
  }

  adjustBpm(delta: number) {
    this.metronome.setBpm(this.metronome.bpm() + delta);
  }

  toggleAccent() {
    this.metronome.accentEnabled.set(!this.metronome.accentEnabled());
  }
}
