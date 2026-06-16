import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';
import * as Tone from 'tone';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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

  return {
    PolySynth: MockPolySynth,
    PluckSynth: MockPluckSynth,
    Synth: {},
    FMSynth: {},
    AMSynth: {},
    getContext: vi.fn().mockReturnValue({ state: 'running' }),
    start: vi.fn(),
    Frequency: vi.fn().mockReturnValue({ toFrequency: vi.fn(), toNote: vi.fn() }),
    now: vi.fn(),
  };
});

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('switchPreset', () => {
    it('should release all, dispose synth, build new synth, and set preset', () => {
      const releaseAllSpy = vi.spyOn(service, 'releaseAll');

      const synthInstance = (service as any).synth;
      const initialDisposeSpy = vi.spyOn(synthInstance, 'dispose');
      const initialReleaseSpy = vi.spyOn(synthInstance, 'releaseAll');

      service.switchPreset('electric-piano');

      expect(releaseAllSpy).toHaveBeenCalled();
      expect(initialReleaseSpy).toHaveBeenCalled();
      expect(initialDisposeSpy).toHaveBeenCalled();

      expect(service.selectedPreset()).toBe('electric-piano');
    });

    it('should build PluckSynth when id is pluck', () => {
      service.switchPreset('pluck');
      expect((service as any).pluckPool.length).toBe(8);
      expect(service.selectedPreset()).toBe('pluck');
    });
  });
});
