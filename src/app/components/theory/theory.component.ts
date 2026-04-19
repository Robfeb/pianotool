import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService } from '../../services/theory.service';

@Component({
  selector: 'app-theory-engine',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theory-panel">
      <div class="header">
        <h3>{{ theory.language() === 'es' ? 'Motor de Teoría' : 'Theory Engine' }}</h3>
        <div class="toggle-wrap">
          <label class="switch">
            <input type="checkbox" [checked]="theory.showOnPiano()" (change)="togglePianoShow()">
            <span class="slider round"></span>
          </label>
          <span class="toggle-label">{{ theory.language() === 'es' ? 'Mostrar' : 'Show' }}</span>
        </div>
      </div>

      <div class="selectors">
        <div class="select-group">
          <label>{{ theory.language() === 'es' ? 'Tónica' : 'Root' }}</label>
          <div class="button-grid roots">
            @for (note of theory.getNoteLibrary(theory.language()); track $index) {
              <button 
                [class.active]="theory.selectedRootIndex() === $index"
                (click)="theory.selectedRootIndex.set($index)">
                {{ note }}
              </button>
            }
          </div>
        </div>

        <div class="select-group">
          <label>{{ theory.language() === 'es' ? 'Acorde' : 'Chord' }}</label>
          <div class="button-grid types">
            @for (def of theory.CHORD_DEFINITIONS; track def.id) {
              <button 
                [class.active]="theory.selectedChordId() === def.id"
                (click)="theory.selectedChordId.set(def.id)">
                {{ theory.language() === 'es' ? def.nameEs : def.nameEn }}
              </button>
            }
          </div>
        </div>
      </div>

      <div class="result-card">
        <div class="chord-title">{{ getChordLabel() }}</div>
        <div class="chord-details">
          <div class="detail-item">
            <span class="label">{{ theory.language() === 'es' ? 'Notas' : 'Notes' }}</span>
            <span class="value">{{ getNoteList() }}</span>
          </div>
          <div class="detail-item">
            <span class="label">{{ theory.language() === 'es' ? 'Fórmula' : 'Formula' }}</span>
            <span class="value">{{ getFormula() }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theory-panel {
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
    h3 {
      color: var(--accent-color);
      margin: 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .selectors {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .select-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .select-group label {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .button-grid {
      display: grid;
      gap: 4px;
    }
    
    .roots {
      grid-template-columns: repeat(6, 1fr);
    }
    
    .types {
      grid-template-columns: repeat(4, 1fr);
    }

    button {
      background: var(--surface-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      padding: 6px 2px;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s ease;
      font-weight: 500;
    }

    button:hover {
      border-color: var(--accent-color);
      background: rgba(243, 156, 18, 0.05);
    }

    button.active {
      background: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
      box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
    }
    
    .result-card {
      background: var(--surface-bg);
      border: 1px solid var(--border-color);
      padding: 10px 14px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .chord-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-color);
    }
    .chord-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
    }
    .detail-item .label { color: var(--text-secondary); }
    .detail-item .value { color: var(--text-primary); font-weight: 600; }

    .toggle-wrap { display: flex; align-items: center; gap: 6px; }
    .toggle-label { font-size: 0.7rem; color: var(--text-secondary); }
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
export class TheoryComponent {
  theory = inject(TheoryService);

  togglePianoShow() {
    this.theory.showOnPiano.set(!this.theory.showOnPiano());
  }

  getChordLabel() {
    const res = this.theory.getChordNames(this.theory.selectedRootIndex(), this.theory.language());
    return res.chordName;
  }

  getNoteList() {
    const notes = this.theory.activeTheoryNotes();
    return notes.map(m => this.theory.getNoteName(m)).join(' - ');
  }

  getFormula() {
    const def = this.theory.CHORD_DEFINITIONS.find(d => d.id === this.theory.selectedChordId());
    const labels = this.theory.language() === 'es' ? def?.intervalsEs : def?.intervalsEn;
    return labels?.join(' - ') || '';
  }
}
