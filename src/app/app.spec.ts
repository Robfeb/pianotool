import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AudioService } from './services/audio.service';
import { MetronomeService } from './services/metronome.service';
import { vi } from 'vitest';

describe('App', () => {
  let audioServiceMock: any;
  let metronomeServiceMock: any;

  beforeEach(async () => {
    audioServiceMock = {
      ensureContext: vi.fn().mockResolvedValue(undefined),
      switchPreset: vi.fn(),
      selectedPreset: vi.fn().mockReturnValue('grand-piano')
    };

    metronomeServiceMock = {
      bpm: vi.fn().mockReturnValue(100),
      isPlaying: vi.fn().mockReturnValue(false),
      accentEnabled: vi.fn().mockReturnValue(true),
      beatsPerMeasure: vi.fn().mockReturnValue(4),
      currentBeatIndex: vi.fn().mockReturnValue(-1),
      toggle: vi.fn(),
      setBpm: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
    })
    .overrideProvider(AudioService, { useValue: audioServiceMock })
    .overrideProvider(MetronomeService, { useValue: metronomeServiceMock })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain("Rob's Piano Tool");
  });
});
