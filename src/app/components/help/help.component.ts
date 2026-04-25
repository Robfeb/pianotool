import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService } from '../../services/theory.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="help-panel">
      <div class="header">
        <h3>{{ theory.language() === 'es' ? 'Guía de Usuario' : 'User Guide' }}</h3>
      </div>

      <div class="help-content">
        <!-- Piano Section -->
        <section>
          <h4>🎹 {{ theory.language() === 'es' ? 'Teclado PC' : 'PC Keyboard' }}</h4>
          <ul>
            <li><strong>A, S, D, F, G, H, J, K, L, Ñ:</strong> {{ theory.language() === 'es' ? 'Teclas blancas' : 'White keys' }}</li>
            <li><strong>W, E, T, Y, U, O, P:</strong> {{ theory.language() === 'es' ? 'Teclas negras' : 'Black keys' }}</li>
            <li><strong>Z / X:</strong> {{ theory.language() === 'es' ? 'Subir/Bajar Octava' : 'Shift Octave Up/Down' }}</li>
            <li><strong>C / V:</strong> {{ theory.language() === 'es' ? 'Cambiar Sonido' : 'Change Instrument Sound' }}</li>
          </ul>
        </section>

        <!-- MIDI Section -->
        <section>
          <h4>🎶 {{ theory.language() === 'es' ? 'Reproductor MIDI' : 'MIDI Player' }}</h4>
          <ul>
            <li><strong>{{ theory.language() === 'es' ? 'Librería:' : 'Library:' }}</strong> {{ theory.language() === 'es' ? 'Selecciona entre +300 canciones y ejercicios.' : 'Select from +300 songs and exercises.' }}</li>
            <li><strong>{{ theory.language() === 'es' ? 'Modo Práctica:' : 'Practice Mode:' }}</strong> {{ theory.language() === 'es' ? 'El sistema espera a que toques la nota correcta.' : 'Wait for you to play the correct note to advance.' }}</li>
            <li><strong>{{ theory.language() === 'es' ? 'Manos:' : 'Hands:' }}</strong> {{ theory.language() === 'es' ? 'Filtra notas para mano izquierda (Rosa) o derecha (Verde).' : 'Filter notes for Left (Pink) or Right (Green) hand.' }}</li>
          </ul>
        </section>

        <!-- Theory Section -->
        <section>
          <h4>📐 {{ theory.language() === 'es' ? 'Motor de Teoría' : 'Theory Engine' }}</h4>
          <ul>
            <li><strong>{{ theory.language() === 'es' ? 'Acordes:' : 'Chords:' }}</strong> {{ theory.language() === 'es' ? 'Selecciona una raíz y tipo para ver el acorde en el piano.' : 'Select root and type to visualize the chord on piano.' }}</li>
            <li><strong>{{ theory.language() === 'es' ? 'Brillo Solar:' : 'Sun Glow:' }}</strong> {{ theory.language() === 'es' ? 'Las notas de teoría brillan en dorado para distinguirse.' : 'Theory notes glow in gold to distinguish from practice.' }}</li>
          </ul>
        </section>

        <!-- Metronome Section -->
        <section>
          <h4>⏱️ {{ theory.language() === 'es' ? 'Metrónomo' : 'Metronome' }}</h4>
          <ul>
            <li><strong>{{ theory.language() === 'es' ? 'Tecla M:' : 'M Key:' }}</strong> {{ theory.language() === 'es' ? 'Iniciar o detener el metrónomo al instante.' : 'Start or stop metronome instantly.' }}</li>
            <li><strong>{{ theory.language() === 'es' ? 'Acento:' : 'Accent:' }}</strong> {{ theory.language() === 'es' ? 'Flashea en rojo en el primer pulso del compás.' : 'Flashes red on the first beat of the measure.' }}</li>
          </ul>
        </section>

        <!-- PWA / Themes -->
        <section>
          <h4>📲 {{ theory.language() === 'es' ? 'App y Temas' : 'App & Themes' }}</h4>
          <ul>
            <li><strong>PWA:</strong> {{ theory.language() === 'es' ? '¡Instala esta web como una app en tu móvil o PC!' : 'Install this web as an app on your mobile or PC!' }}</li>
            <li><strong>🌙 / ☀️:</strong> {{ theory.language() === 'es' ? 'Cambia entre modo oscuro y claro.' : 'Switch between Dark and Light themes.' }}</li>
          </ul>
        </section>

        <!-- Close Button for Tutorial feel -->
        <section class="close-section">
          <button class="got-it-btn" (click)="theory.showHelpSection.set(false)">
            {{ theory.language() === 'es' ? '¡Entendido!' : 'Got it!' }}
          </button>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .help-panel {
      background: var(--panel-bg);
      padding: 16px;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-main);
      display: flex;
      flex-direction: column;
      gap: 12px;
      border: 1px solid var(--border-color);
      max-height: 500px;
      overflow-y: auto;
    }

    h3 {
      color: var(--accent-color);
      margin: 0;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .help-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    section {
      background: var(--surface-bg);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    h4 {
      margin: 0 0 8px 0;
      font-size: 0.85rem;
      color: var(--accent-color);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 4px;
    }

    ul {
      margin: 0;
      padding: 0 0 0 15px;
      list-style-type: none;
    }

    li {
      font-size: 0.75rem;
      color: var(--text-primary);
      margin-bottom: 6px;
      line-height: 1.3;
      position: relative;
    }
    li::before {
      content: '•';
      color: var(--accent-color);
      position: absolute;
      left: -12px;
    }

    li strong {
      color: var(--text-secondary);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .help-content {
        grid-template-columns: 1fr;
      }
    }

    .close-section {
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent !important;
      border: none !important;
      grid-column: 1 / -1;
    }

    .got-it-btn {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      font-weight: 700;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .got-it-btn:hover {
      transform: scale(1.05);
      filter: brightness(1.1);
    }
    .got-it-btn:active {
      transform: scale(0.95);
    }
  `]
})
export class HelpComponent {
  theory = inject(TheoryService);
}
