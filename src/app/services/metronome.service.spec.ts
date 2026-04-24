import { TestBed } from '@angular/core/testing';
import { MetronomeService } from './metronome.service';
import { AudioService } from './audio.service';
import { vi } from 'vitest';

vi.mock('tone', () => {
  return {
    MembraneSynth: class {
      volume = { value: 0 };
      toDestination() { return this; }
      triggerAttackRelease() {}
    },
    PolySynth: class {
      toDestination() { return this; }
      set() {}
      triggerAttackRelease() {}
      triggerRelease() {}
      releaseAll() {}
      volume = { value: 0 };
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
    })
  };
});

describe('MetronomeService', () => {
  let service: MetronomeService;
  let audioServiceMock: any;

  beforeEach(() => {
    audioServiceMock = {
      ensureContext: vi.fn().mockResolvedValue(undefined)
    };

    TestBed.configureTestingModule({
      providers: [
        MetronomeService,
        { provide: AudioService, useValue: audioServiceMock }
      ]
    });
    service = TestBed.inject(MetronomeService);
  });

  describe('toggle', () => {
    it('should call start if it is not playing', async () => {
      service.start = vi.fn().mockImplementation(() => {
        service.isPlaying.set(true);
      });
      service.stop = vi.fn();

      service.isPlaying.set(false);

      await service.toggle();

      expect(service.start).toHaveBeenCalled();
      expect(service.stop).not.toHaveBeenCalled();
      expect(service.isPlaying()).toBe(true);
    });

    it('should call stop if it is playing', async () => {
      service.start = vi.fn();
      service.stop = vi.fn().mockImplementation(() => {
        service.isPlaying.set(false);
      });

      service.isPlaying.set(true);

      await service.toggle();

      expect(service.stop).toHaveBeenCalled();
      expect(service.start).not.toHaveBeenCalled();
      expect(service.isPlaying()).toBe(false);
    });
  });
});
