import 'vitest-dom/extend-expect'
import { vi } from 'vitest'

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
  return {
    Synth: class {
      toDestination() { return this; }
      set() {}
      triggerAttackRelease() {}
      triggerRelease() {}
      releaseAll() {}
      volume = { value: 0 };
    },
    PolySynth: class {
      toDestination() { return this; }
      set() {}
      triggerAttackRelease() {}
      triggerRelease() {}
      releaseAll() {}
      volume = { value: 0 };
    },
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
      stop: vi.fn()
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
    Part: class {
      start() {}
      stop() {}
      clear() {}
    },
    PluckSynth: class {
      toDestination() { return this; }
      triggerAttackRelease() {}
      volume = { value: 0 };
    },
    start: vi.fn().mockResolvedValue(undefined)
  };
});
