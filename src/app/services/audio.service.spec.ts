import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';
import * as Tone from 'tone';
import { vi } from 'vitest';

// Mock Tone.js
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

  const mockPluckSynth = {
    toDestination: vi.fn().mockReturnThis(),
    triggerAttack: vi.fn(),
    dispose: vi.fn(),
  };

  return {
    PolySynth: vi.fn(function() { return mockSynth; }),
    PluckSynth: vi.fn(function() { return mockPluckSynth; }),
    Synth: {},
    FMSynth: {},
    AMSynth: {},
    Frequency: vi.fn(() => ({
      toFrequency: vi.fn(() => 440),
      toNote: vi.fn(() => 'A4'),
    })),
    now: vi.fn(() => 0),
    getContext: vi.fn(() => ({ state: 'running' })),
    start: vi.fn(),
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
    expect(service.selectedPreset()).toBe('grand-piano');
  });

  it('should switch preset', () => {
    service.switchPreset('electric-piano');
    expect(service.selectedPreset()).toBe('electric-piano');
    // PolySynth should have been instantiated again
    expect(Tone.PolySynth).toHaveBeenCalled();
  });

  it('should switch to pluck preset and initialize pluck pool', () => {
    service.switchPreset('pluck');
    expect(service.selectedPreset()).toBe('pluck');
    expect(Tone.PluckSynth).toHaveBeenCalledTimes(8); // PLUCK_POOL_SIZE is 8
  });

  it('should play note correctly for synth', () => {
    service.switchPreset('grand-piano');
    service.playNote(60);
    // Since we mocked PolySynth to return mockSynth, we can check its triggerAttack
    const synthMock = new (Tone.PolySynth as any)();
    expect(synthMock.triggerAttack).toHaveBeenCalledWith('A4', 0, 0.8);
  });

  it('should play note correctly for pluck', () => {
    service.switchPreset('pluck');
    service.playNote(60);
    const pluckMock = new (Tone.PluckSynth as any)();
    expect(pluckMock.triggerAttack).toHaveBeenCalledWith(440, 0);
  });

  it('should trigger attack release correctly for synth', () => {
    service.switchPreset('grand-piano');
    service.triggerAttackRelease(60, 1, 0);
    const synthMock = new (Tone.PolySynth as any)();
    expect(synthMock.triggerAttackRelease).toHaveBeenCalledWith('A4', 1, 0, 0.8);
  });

  it('should trigger attack correctly for pluck when triggerAttackRelease is called', () => {
    service.switchPreset('pluck');
    service.triggerAttackRelease(60, 1, 0);
    const pluckMock = new (Tone.PluckSynth as any)();
    expect(pluckMock.triggerAttack).toHaveBeenCalledWith(440, 0);
  });

  it('should release note for synth', () => {
    service.switchPreset('grand-piano');
    service.releaseNote(60);
    const synthMock = new (Tone.PolySynth as any)();
    expect(synthMock.triggerRelease).toHaveBeenCalledWith('A4', 0);
  });

  it('should ignore release note for pluck', () => {
    service.switchPreset('pluck');
    service.releaseNote(60);
    const synthMock = new (Tone.PolySynth as any)();
    expect(synthMock.triggerRelease).not.toHaveBeenCalled();
  });

  it('should release all', () => {
    service.switchPreset('grand-piano');
    service.releaseAll();
    const synthMock = new (Tone.PolySynth as any)();
    expect(synthMock.releaseAll).toHaveBeenCalled();
  });

  it('should ensure context is running', async () => {
    (Tone.getContext as any).mockReturnValueOnce({ state: 'suspended' });
    await service.ensureContext();
    expect(Tone.start).toHaveBeenCalled();
  });
});
