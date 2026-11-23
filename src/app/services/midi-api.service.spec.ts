import { TestBed } from '@angular/core/testing';
import { MidiApiService } from './midi-api.service';
import { AudioService } from './audio.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('MidiApiService', () => {
  let service: MidiApiService;
  let audioServiceSpy: any;

  beforeEach(() => {
    audioServiceSpy = {
      playNote: vi.fn(),
      releaseNote: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        MidiApiService,
        { provide: AudioService, useValue: audioServiceSpy }
      ]
    });
    service = TestBed.inject(MidiApiService);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created and disconnected', () => {
    expect(service).toBeTruthy();
    expect(service.isConnected()).toBe(false);
  });

  it('should warn if Web MIDI is unsupported', async () => {
    const original = navigator.requestMIDIAccess;
    (navigator as any).requestMIDIAccess = undefined;
    await service.requestAccess();
    expect(console.warn).toHaveBeenCalledWith('Web MIDI API not supported in this browser.');
    (navigator as any).requestMIDIAccess = original;
  });

  describe('with MIDI support', () => {
    let mockMidiAccess: any;
    let mockInput: any;
    let originalRequestMIDIAccess: any;

    beforeEach(() => {
      mockInput = { onmidimessage: null };
      mockMidiAccess = {
        inputs: new Map([['input1', mockInput]]),
        onstatechange: null
      };
      originalRequestMIDIAccess = navigator.requestMIDIAccess;
      (navigator as any).requestMIDIAccess = vi.fn().mockResolvedValue(mockMidiAccess);
    });

    afterEach(() => {
      (navigator as any).requestMIDIAccess = originalRequestMIDIAccess;
    });

    it('should connect and attach listeners', async () => {
      await service.requestAccess();
      expect(service.isConnected()).toBe(true);
      expect(typeof mockInput.onmidimessage).toBe('function');
    });

    it('should handle requestAccess failure', async () => {
      const error = new Error('Denied');
      (navigator as any).requestMIDIAccess.mockRejectedValue(error);
      await service.requestAccess();
      expect(console.error).toHaveBeenCalledWith('MIDI Access denied or failed', error);
      expect(service.isConnected()).toBe(false);
    });

    it('should handle MIDI note on and note off messages', async () => {
      await service.requestAccess();
      const onMidiMessage = mockInput.onmidimessage;
      onMidiMessage({ data: [0x90, 60, 100] });
      expect(audioServiceSpy.playNote).toHaveBeenCalledWith(60, 100 / 127);
      onMidiMessage({ data: [0x80, 60, 0] });
      expect(audioServiceSpy.releaseNote).toHaveBeenCalledWith(60);
    });

    it('should handle note off with zero velocity', async () => {
      await service.requestAccess();
      const onMidiMessage = mockInput.onmidimessage;
      onMidiMessage({ data: [0x90, 60, 100] });
      onMidiMessage({ data: [0x90, 60, 0] });
      expect(service.activeMidiNotes().has(60)).toBe(false);
      expect(audioServiceSpy.releaseNote).toHaveBeenCalledWith(60);
    });

    it('should ignore short messages', async () => {
      await service.requestAccess();
      mockInput.onmidimessage({ data: [0x90, 60] });
      expect(service.activeMidiNotes().size).toBe(0);
      expect(audioServiceSpy.playNote).not.toHaveBeenCalled();
    });
  });
});
