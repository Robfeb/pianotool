import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';
import * as Tone from 'tone';
import { vi } from 'vitest';

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
    expect(Tone.PolySynth).toHaveBeenCalled();
  });

  it('should build PluckSynth when id is pluck', () => {
    service.switchPreset('pluck');
    expect((service as any).pluckPool.length).toBe(8);
    expect(service.selectedPreset()).toBe('pluck');
  });

  it('should play note correctly for synth', () => {
    service.switchPreset('grand-piano');
    service.playNote(60);
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

  it('should trigger attack correctly for pluck', () => {
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
