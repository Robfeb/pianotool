import { vi } from 'vitest'

const localStorageMock = (() => {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => store.set(key, String(value))),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    get length() { return store.size; }
  };
})();

vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('navigator', { ...window.navigator, requestMIDIAccess: vi.fn() });

window.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn().mockReturnValue({ gain: { value: 1, setValueAtTime: vi.fn() }, connect: vi.fn() }),
  createOscillator: vi.fn().mockReturnValue({ start: vi.fn(), stop: vi.fn(), connect: vi.fn(), frequency: { value: 440, setValueAtTime: vi.fn() } }),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
}))
window.OfflineAudioContext = window.AudioContext;

// Mock Tone completely
vi.mock('tone', () => {
  const polySynthInstance = {
    triggerAttack: vi.fn(),
    triggerAttackRelease: vi.fn(),
    triggerRelease: vi.fn(),
    releaseAll: vi.fn(),
    dispose: vi.fn(),
    volume: { value: 0 },
    toDestination: vi.fn().mockReturnThis()
  };
  const pluckSynthInstance = {
    triggerAttack: vi.fn(),
    triggerAttackRelease: vi.fn(),
    triggerRelease: vi.fn(),
    releaseAll: vi.fn(),
    dispose: vi.fn(),
    volume: { value: 0 },
    toDestination: vi.fn().mockReturnThis()
  };
  const PolySynth = vi.fn(function() { return polySynthInstance; });
  const PluckSynth = vi.fn(function() { return pluckSynthInstance; });
  class MockSynth {}

  return {
    Synth: MockSynth,
    PolySynth,
    FMSynth: MockSynth,
    AMSynth: MockSynth,
    PluckSynth,
    MembraneSynth: class {
      volume = { value: 0 };
      toDestination() { return this; }
      triggerAttackRelease() {}
    },
    Loop: class {
      start() {}
      stop() {}
    },
    getTransport: () => ({
      bpm: { value: 100 },
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      cancel: vi.fn(),
      seconds: 0
    }),
    getDraw: () => ({
      schedule: vi.fn()
    }),
    Transport: {
      bpm: { value: 100 },
      start: vi.fn(),
      stop: vi.fn(),
      position: '0:0:0'
    },
    Part: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
      playbackRate: 1
    })),
    Frequency: vi.fn(() => ({
      toFrequency: vi.fn(() => 440),
      toNote: vi.fn(() => 'A4')
    })),
    now: vi.fn(() => 0),
    getContext: vi.fn(() => ({ state: 'running' })),
    start: vi.fn().mockResolvedValue(undefined),
    Draw: { schedule: vi.fn() }
  };
});
