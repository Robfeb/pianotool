import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';
import { AudioService } from './services/audio.service';
import { MetronomeService } from './services/metronome.service';
import { signal } from '@angular/core';

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
  tempo = signal(120);
  beatsPerMeasure = signal(4);
  currentBeat = signal(0);
  toggle = vi.fn();
  setBpm = vi.fn();
  setTempo = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  initAudio = vi.fn();
  setBeatVolume = vi.fn();
  setSubdivision = vi.fn();
  toggleTickMode = vi.fn();
  beatVolume = signal(0);
  subdivision = signal('1/4');
  isTickMode = signal(false);
}

vi.mock('tone', () => {
  const synth = {
    toDestination: vi.fn().mockReturnThis(),
    triggerAttack: vi.fn(),
    triggerAttackRelease: vi.fn(),
    triggerRelease: vi.fn(),
    releaseAll: vi.fn(),
    dispose: vi.fn(),
    volume: { value: 0 },
  };
  return {
    PolySynth: vi.fn(function() { return synth; }),
    PluckSynth: vi.fn(function() { return synth; }),
    MembraneSynth: vi.fn(function() { return synth; }),
    Synth: {},
    FMSynth: {},
    AMSynth: {},
    Frequency: vi.fn(() => ({ toFrequency: vi.fn(), toNote: vi.fn() })),
    now: vi.fn(),
    getContext: vi.fn(() => ({ state: 'running' })),
    start: vi.fn(),
    Loop: vi.fn(function() { return { start: vi.fn(), stop: vi.fn() }; }),
    Transport: { start: vi.fn(), stop: vi.fn(), bpm: { value: 120 } },
    getTransport: vi.fn(() => ({ start: vi.fn(), stop: vi.fn(), bpm: { value: 120 } }))
  };
});

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
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain("Piano Tool");
  });
});
