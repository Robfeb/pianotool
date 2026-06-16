import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { vi } from 'vitest';

// Mock Tone.js globally to avoid Web Audio API errors in App component tests
vi.mock('tone', () => {
  const mockSynth = {
    toDestination: vi.fn().mockReturnThis(),
    triggerAttack: vi.fn(),
    triggerAttackRelease: vi.fn(),
    triggerRelease: vi.fn(),
    releaseAll: vi.fn(),
    dispose: vi.fn(),
    volume: { value: 0 },
  };

  return {
    PolySynth: vi.fn(function() { return mockSynth; }),
    PluckSynth: vi.fn(function() { return mockSynth; }),
    MembraneSynth: vi.fn(function() { return mockSynth; }),
    Synth: {},
    FMSynth: {},
    AMSynth: {},
    Frequency: vi.fn(() => ({
      toFrequency: vi.fn(),
      toNote: vi.fn(),
    })),
    now: vi.fn(),
    getContext: vi.fn(() => ({ state: 'running' })),
    start: vi.fn(),
    Loop: vi.fn(function() { return { start: vi.fn(), stop: vi.fn() }; }),
    Transport: {
      start: vi.fn(),
      stop: vi.fn(),
      bpm: { value: 120 }
    },
    getTransport: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      bpm: { value: 120 }
    }))
  };
});

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
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Rob\'s Piano Tool');
  });
});
