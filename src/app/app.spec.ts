import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AudioService } from './services/audio.service';
import { MetronomeService } from './services/metronome.service';
import { signal } from '@angular/core';

// Provide a mock AudioService to avoid ToneJS context issues in tests
class MockAudioService {
  selectedPreset = signal('grand-piano');
  switchPreset = vi.fn();
  ensureContext = vi.fn();
  playNote = vi.fn();
  triggerAttackRelease = vi.fn();
  releaseNote = vi.fn();
  releaseAll = vi.fn();
}

class MockMetronomeService {
  isPlaying = signal(false);
  bpm = signal(120);
  currentBeat = signal(0);
  toggle = vi.fn();
  setBpm = vi.fn();
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
    .overrideProvider(AudioService, { useValue: new MockAudioService() })
    .overrideProvider(MetronomeService, { useValue: new MockMetronomeService() })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges(); // Trigger change detection
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain("Rob's Piano Tool");
  });
});
