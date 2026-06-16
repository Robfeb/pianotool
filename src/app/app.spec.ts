import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { vi } from 'vitest';

// Mock Tone.js globally for app-level tests
vi.mock('tone', () => {
  const PolySynthMock = vi.fn(function() {
    return {
      toDestination: vi.fn().mockReturnThis(),
      volume: { value: 0 },
      triggerAttackRelease: vi.fn(),
      triggerAttack: vi.fn(),
      triggerRelease: vi.fn(),
      releaseAll: vi.fn(),
      dispose: vi.fn(),
    };
  });
  const MembraneSynthMock = vi.fn(function() {
    return {
      toDestination: vi.fn().mockReturnThis(),
      volume: { value: 0 },
      triggerAttackRelease: vi.fn(),
    };
  });
  const LoopMock = vi.fn(function() {
    return {
      start: vi.fn(),
      stop: vi.fn(),
    };
  });
  const PluckSynthMock = vi.fn(function() {
    return {
      toDestination: vi.fn().mockReturnThis(),
      triggerAttack: vi.fn(),
      dispose: vi.fn(),
    };
  });

  return {
    Loop: LoopMock,
    MembraneSynth: MembraneSynthMock,
    PolySynth: PolySynthMock,
    PluckSynth: PluckSynthMock,
    getTransport: vi.fn().mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      bpm: { value: 120 },
    }),
    getDraw: vi.fn().mockReturnValue({
      schedule: vi.fn((cb) => cb()),
    }),
    getContext: vi.fn().mockReturnValue({
      state: 'running',
    }),
    start: vi.fn().mockResolvedValue(undefined),
    Synth: vi.fn(),
    FMSynth: vi.fn(),
    AMSynth: vi.fn(),
  };
});

// Mock web midi api if not present
if (!navigator.requestMIDIAccess) {
  (navigator as any).requestMIDIAccess = vi.fn().mockResolvedValue({
    inputs: new Map(),
    outputs: new Map(),
    onstatechange: vi.fn(),
  });
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
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
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain("Rob's Piano Tool");
  });
});
