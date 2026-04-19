import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService } from '../../services/theory.service';

@Component({
  selector: 'app-theory-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theory-panel">
      <h3>{{ theory.language() === 'es' ? 'Motor de Teoría' : 'Theory Engine' }}</h3>

      <div class="row">
        <label>{{ theory.language() === 'es' ? 'Progresión:' : 'Progression:' }}</label>
        <select (change)="selectProgression($event)">
          <option value="">-- {{ theory.language() === 'es' ? 'Seleccionar' : 'Select' }} --</option>
          @for (prog of theory.progressions; track prog.name) {
            <option [value]="prog.name">{{ prog.name }}</option>
          }
        </select>
      </div>

      <div class="detected-chord">
        <p>
          {{ theory.language() === 'es' ? 'Acorde detectado:' : 'Detected chord:' }}
          <span class="highlight" [style.color]="detectedColor()">{{ detectedLabel() }}</span>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .theory-panel {
      background: var(--panel-bg);
      padding: 20px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-main);
    }
    h3 {
      margin-bottom: 15px;
      color: var(--accent-color);
      font-size: 1rem;
    }
    .row {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 15px;
    }
    label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    select {
      background: var(--surface-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      padding: 8px;
      border-radius: 4px;
      font-family: inherit;
    }
    .detected-chord {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid var(--border-color);
      font-size: 0.9rem;
    }
    .highlight {
      font-weight: 600;
    }
  `]
})
export class TheoryControlsComponent {
  theory = inject(TheoryService);

  detectedLabel() {
    return this.theory.language() === 'es' ? 'Do Mayor (Demo)' : 'C Major (Demo)';
  }

  detectedColor() {
    // Root is C → pitch class 0 → index 0
    return this.theory.getNoteColor(60);
  }

  selectProgression(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    // Future: trigger keyboard highlighting
  }
}
