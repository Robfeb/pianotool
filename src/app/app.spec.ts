import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { vi } from 'vitest';

vi.mock('tone', () => {
  class MockPolySynth {
    toDestination() { return this; }
    dispose() {}
    releaseAll() {}
    triggerAttack() {}
    triggerAttackRelease() {}
    triggerRelease() {}
    volume = { value: 0 };
  }

  class MockPluckSynth {
    toDestination() { return this; }
    dispose() {}
    triggerAttack() {}
  }

  class MockMembraneSynth {
    toDestination() { return this; }
    triggerAttackRelease() {}
    volume = { value: 0 };
  }

  class MockLoop {
    constructor(callback: any, interval: any) {}
    start() {}
    stop() {}
  }

  return {
    PolySynth: MockPolySynth,
    PluckSynth: MockPluckSynth,
    MembraneSynth: MockMembraneSynth,
    Loop: MockLoop,
    Synth: {},
    FMSynth: {},
    AMSynth: {},
    getContext: vi.fn().mockReturnValue({ state: 'running' }),
    start: vi.fn(),
    Frequency: vi.fn().mockReturnValue({ toFrequency: vi.fn(), toNote: vi.fn() }),
    now: vi.fn(),
    getTransport: vi.fn().mockReturnValue({
      scheduleRepeat: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      state: 'stopped',
      bpm: { value: 120 }
    }),
    Transport: {
      scheduleRepeat: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      state: 'stopped',
      bpm: { value: 120 }
    }
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
