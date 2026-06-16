import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AudioService } from './services/audio.service';
import { MetronomeService } from './services/metronome.service';
import { signal } from '@angular/core';

describe('App', () => {
  beforeEach(async () => {
    const audioServiceMock = {
      selectedPreset: signal('grand-piano'),
      switchPreset: vi.fn(),
      ensureContext: vi.fn(),
      playNote: vi.fn(),
      triggerAttackRelease: vi.fn(),
      releaseNote: vi.fn(),
      releaseAll: vi.fn()
    };

    const metronomeServiceMock = {
      tempo: signal(120),
      isPlaying: signal(false),
      beatsPerMeasure: signal(4),
      setTempo: vi.fn(),
      toggle: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      initAudio: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AudioService, useValue: audioServiceMock },
        { provide: MetronomeService, useValue: metronomeServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain("Rob's Piano Tool");
  });
});
