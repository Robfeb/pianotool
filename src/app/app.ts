import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { TheoryComponent } from './components/theory/theory.component';
import { MidiPlayerComponent } from './components/midi-player/midi-player.component';
import { MetronomeComponent } from './components/metronome/metronome.component';
import { HelpComponent } from './components/help/help.component';
import { MidiApiService } from './services/midi-api.service';
import { TheoryService } from './services/theory.service';
import { MetronomeService } from './services/metronome.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, KeyboardComponent, TheoryComponent, MidiPlayerComponent, MetronomeComponent, HelpComponent],
  template: `
    <header class="app-header">
      <div class="header-left">
        <h1>🎹 Rob's Piano Tool</h1>
        <div class="midi-status">
          <span class="status-indicator" [class.connected]="midiApi.isConnected()"></span>
          {{ midiApi.isConnected() ? 'MIDI Controller Connected' : (theory.language() === 'es' ? 'Esperando controlador MIDI...' : 'Waiting for MIDI Controller...') }}
        </div>
      </div>
      
      <div class="header-right">
        <!-- Mobile Menu Toggle -->
        <button class="menu-toggle-btn" (click)="showMobileMenu.set(!showMobileMenu())">
          {{ showMobileMenu() ? (theory.language() === 'es' ? 'Ocultar Opciones' : 'Hide Options') : (theory.language() === 'es' ? 'Mostrar Opciones' : 'Show Options') }}
          <span class="chevron" [class.open]="showMobileMenu()">▼</span>
        </button>

        <div class="controls-container" [class.mobile-open]="showMobileMenu()">
          <div class="controls-group">
            <button class="toggle-btn" [class.active]="theory.showTheorySection()" (click)="toggleTheory()">
              {{ theory.language() === 'es' ? 'Teoría' : 'Theory' }}
            </button>
            <button class="toggle-btn" [class.active]="theory.showMidiSection()" (click)="toggleMidi()">
              MIDI
            </button>
            <button class="toggle-btn" [class.active]="theory.showMetronomeSection()" (click)="toggleMetronome()">
              {{ theory.language() === 'es' ? 'Metrónomo' : 'Metronome' }}
            </button>
          </div>

          <div class="icon-btns-group">
            <button class="icon-btn theme-toggle" (click)="theory.toggleTheme()" [title]="theory.language() === 'es' ? 'Cambiar Tema' : 'Toggle Theme'">
              @if (theory.theme() === 'dark') {
                🌙
              } @else {
                ☀️
              }
            </button>

            <button class="icon-btn lang-toggle" (click)="theory.toggleLanguage()">
              {{ theory.language() === 'en' ? '🇺🇸' : '🇪🇸' }}
            </button>

            <button class="icon-btn help-toggle" [class.active]="theory.showHelpSection()" (click)="toggleHelp()" [title]="theory.language() === 'es' ? 'Ayuda' : 'Help'">
              ❓
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="dashboard" [class.light-mode]="theory.theme() === 'light'">
      <div class="top-row" *ngIf="theory.showTheorySection() || theory.showMidiSection() || theory.showMetronomeSection() || theory.showHelpSection()">
        <app-theory-engine *ngIf="theory.showTheorySection()" class="panel-left"></app-theory-engine>
        <app-midi-player *ngIf="theory.showMidiSection()" class="panel-right"></app-midi-player>
        <app-metronome *ngIf="theory.showMetronomeSection()" class="panel-extra"></app-metronome>
        <app-help *ngIf="theory.showHelpSection()" class="panel-full"></app-help>
      </div>
      
      <div class="keyboard-row">
        <app-keyboard></app-keyboard>
      </div>
    </main>
  `,
  styles: [`
    .app-header {
      background: var(--surface-bg);
      padding: 10px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10;
      border-bottom: 1px solid var(--border-color);
    }

    .menu-toggle-btn { display: none; }
    .controls-container { display: flex; align-items: center; gap: 20px; }
    .icon-btns-group { display: flex; align-items: center; gap: 15px; }
    
    h1 { font-size: 1.2rem; margin: 0; }

    .header-left { display: flex; flex-direction: column; gap: 4px; }
    .header-right { display: flex; align-items: center; gap: 20px; }

    .midi-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e74c3c;
      box-shadow: 0 0 6px #e74c3c;
    }

    .status-indicator.connected {
      background: #2ecc71;
      box-shadow: 0 0 6px #2ecc71;
    }

    .controls-group {
      display: flex;
      background: var(--bg-color);
      padding: 4px;
      border-radius: 8px;
      gap: 4px;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      background: var(--surface-bg);
      color: var(--accent-color);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .icon-btn {
      background: var(--bg-color);
      border: 1px solid var(--border-color);
      width: 34px;
      height: 34px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: all 0.2s;
    }
    .icon-btn:hover { border-color: var(--accent-color); }

    .dashboard {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
      background-color: var(--bg-color);
    }

    .top-row {
      display: flex;
      gap: 20px;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .panel-left { flex: 1.2; }
    .panel-right { flex: 1.2; }
    .panel-extra { flex: 1; }
    .panel-full { width: 100%; }
    .keyboard-row { width: 100%; margin-top: auto; }

    /* --- Responsive Queries --- */
    
    @media (max-width: 1024px) {
      .top-row {
        flex-direction: column;
        gap: 15px;
      }
      .panel-left, .panel-right, .panel-extra {
        flex: none;
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .app-header {
        flex-direction: row;
        flex-wrap: wrap;
        padding: 12px 20px;
        gap: 10px;
      }
      
      .header-left { width: auto; }
      .header-right { width: auto; }

      .menu-toggle-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .chevron {
        font-size: 0.7rem;
        transition: transform 0.3s;
      }
      .chevron.open { transform: rotate(180deg); }

      .controls-container {
        display: none;
        width: 100%;
        flex-direction: column;
        gap: 15px;
        padding-top: 10px;
        border-top: 1px solid var(--border-color);
        margin-top: 10px;
      }

      .controls-container.mobile-open {
        display: flex;
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .controls-group {
        width: 100%;
        justify-content: space-between;
      }

      .icon-btns-group {
        display: flex;
        justify-content: center;
        gap: 20px;
        width: 100%;
      }

      .dashboard {
        padding: 10px;
        gap: 10px;
      }
      h1 { font-size: 1.1rem; }
    }
  `]
})
export class App implements OnInit {
  midiApi = inject(MidiApiService);
  theory = inject(TheoryService);
  metronome = inject(MetronomeService);
  showMobileMenu = signal(false);

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key.toLowerCase() === 'm') {
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      if (!isInput) {
        event.preventDefault();
        this.metronome.toggle();
      }
    }
  }

  constructor() {
    // Apply theme to document root
    effect(() => {
      const isLight = this.theory.theme() === 'light';
      document.documentElement.classList.toggle('light-mode', isLight);
    });
  }

  ngOnInit() {
    this.midiApi.requestAccess();

    // Check for first-time tutorial
    const tutorialShown = localStorage.getItem('piano_tool_tutorial_shown');
    if (!tutorialShown) {
      setTimeout(() => {
        this.theory.showHelpSection.set(true);
        localStorage.setItem('piano_tool_tutorial_shown', 'true');
      }, 1000);
    }
  }

  toggleTheory() {
    this.theory.showTheorySection.set(!this.theory.showTheorySection());
  }

  toggleMidi() {
    this.theory.showMidiSection.set(!this.theory.showMidiSection());
  }

  toggleMetronome() {
    this.theory.showMetronomeSection.set(!this.theory.showMetronomeSection());
  }

  toggleHelp() {
    this.theory.showHelpSection.set(!this.theory.showHelpSection());
  }
}
