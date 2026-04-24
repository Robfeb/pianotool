import { TestBed } from '@angular/core/testing';
import { MetronomeService } from './metronome.service';
import { AudioService } from './audio.service';
import { vi } from 'vitest';
import * as Tone from 'tone';
import { effect } from '@angular/core';

// Mock Tone.js
vi.mock('tone', () => {
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
  return {
    Loop: LoopMock,
    MembraneSynth: MembraneSynthMock,
    getTransport: vi.fn().mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      bpm: { value: 120 },
    }),
    getDraw: vi.fn().mockReturnValue({
      schedule: vi.fn((cb) => cb()),
    }),
  };
});

describe('MetronomeService', () => {
  let service: MetronomeService;
  let mockAudioService: any;

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();

    mockAudioService = {
      ensureContext: vi.fn().mockResolvedValue(undefined),
    };

    // Setup LocalStorage Mock
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        clear: vi.fn(() => {
          store = {};
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        })
      };
    })();
    vi.stubGlobal('localStorage', localStorageMock);

    TestBed.configureTestingModule({
      providers: [
        MetronomeService,
        { provide: AudioService, useValue: mockAudioService },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Initialization', () => {
    it('should be created with default values', () => {
      service = TestBed.inject(MetronomeService);
      expect(service).toBeTruthy();
      expect(service.bpm()).toBe(100);
      expect(service.isPlaying()).toBe(false);
      expect(service.accentEnabled()).toBe(true);
      expect(service.beatsPerMeasure()).toBe(4);
      expect(service.currentBeatIndex()).toBe(-1);
    });

    it('should load values from localStorage if available', () => {
      localStorage.setItem('metronome_bpm', '120');
      localStorage.setItem('metronome_accentEnabled', 'false');
      localStorage.setItem('metronome_beatsPerMeasure', '3');

      service = TestBed.inject(MetronomeService);

      expect(service.bpm()).toBe(120);
      expect(service.accentEnabled()).toBe(false);
      expect(service.beatsPerMeasure()).toBe(3);
    });

    it('should handle malformed JSON in localStorage gracefully', () => {
      localStorage.setItem('metronome_bpm', '{malformed_json');

      service = TestBed.inject(MetronomeService);

      expect(service.bpm()).toBe(100); // Fallback to default
    });
  });

  describe('start()', () => {
    beforeEach(() => {
      service = TestBed.inject(MetronomeService);
    });

    it('should start transport and loop and set isPlaying to true', () => {
      service.start();
      expect(Tone.getTransport().start).toHaveBeenCalled();
      expect(service.isPlaying()).toBe(true);
    });
  });

  describe('stop()', () => {
    beforeEach(() => {
      service = TestBed.inject(MetronomeService);
    });

    it('should stop transport and loop, set isPlaying to false, and currentBeatIndex to -1', () => {
      service.start(); // Ensure it is playing first
      service.stop();
      expect(Tone.getTransport().stop).toHaveBeenCalled();
      expect(service.isPlaying()).toBe(false);
      expect(service.currentBeatIndex()).toBe(-1);
    });
  });

  describe('toggle()', () => {
    beforeEach(() => {
      service = TestBed.inject(MetronomeService);
    });

    it('should start if not playing', async () => {
      const startSpy = vi.spyOn(service, 'start');
      await service.toggle();
      expect(mockAudioService.ensureContext).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
      expect(service.isPlaying()).toBe(true);
    });

    it('should stop if playing', async () => {
      service.start();
      const stopSpy = vi.spyOn(service, 'stop');
      await service.toggle();
      expect(mockAudioService.ensureContext).toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
      expect(service.isPlaying()).toBe(false);
    });
  });

  describe('setBpm()', () => {
    beforeEach(() => {
      service = TestBed.inject(MetronomeService);
    });

    it('should set valid BPM', () => {
      service.setBpm(150);
      expect(service.bpm()).toBe(150);
    });

    it('should clamp values below 40', () => {
      service.setBpm(20);
      expect(service.bpm()).toBe(40);
    });

    it('should clamp values above 240', () => {
      service.setBpm(300);
      expect(service.bpm()).toBe(240);
    });
  });
});
