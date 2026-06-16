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

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isConnected()).toBe(false);
  });

  it('should log warning if requestMIDIAccess is not supported', async () => {
    // navigator.requestMIDIAccess is undefined by default in most test environments
    const originalRequestMIDIAccess = navigator.requestMIDIAccess;
    (navigator as any).requestMIDIAccess = undefined;

    await service.requestAccess();
    expect(console.warn).toHaveBeenCalledWith('Web MIDI API not supported in this browser.');
    expect(service.isConnected()).toBe(false);

    (navigator as any).requestMIDIAccess = originalRequestMIDIAccess;
  });

  describe('with MIDI support', () => {
    let mockMidiAccess: any;
    let mockInput: any;
    let originalRequestMIDIAccess: any;

    beforeEach(() => {
      mockInput = {
        onmidimessage: null
      };

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

    it('should successfully connect and attach listeners', async () => {
      await service.requestAccess();

      expect(navigator.requestMIDIAccess).toHaveBeenCalled();
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

    it('should re-attach listeners on state change', async () => {
      await service.requestAccess();

      mockInput.onmidimessage = null;

      if (mockMidiAccess.onstatechange) {
        mockMidiAccess.onstatechange({} as any);
      }

      expect(typeof mockInput.onmidimessage).toBe('function');
    });

    it('should handle MIDI note on message', async () => {
      await service.requestAccess();

      const onMidiMessage = mockInput.onmidimessage;

      onMidiMessage({ data: [0x90, 60, 100] });

      expect(service.activeMidiNotes().get(60)).toBe(100);
      expect(audioServiceSpy.playNote).toHaveBeenCalledWith(60, 100 / 127);
    });

    it('should handle MIDI note off message (command 8)', async () => {
      await service.requestAccess();
      const onMidiMessage = mockInput.onmidimessage;

      onMidiMessage({ data: [0x90, 60, 100] });

      onMidiMessage({ data: [0x80, 60, 0] });

      expect(service.activeMidiNotes().has(60)).toBe(false);
      expect(audioServiceSpy.releaseNote).toHaveBeenCalledWith(60);
    });

    it('should handle MIDI note off message (command 9 with 0 velocity)', async () => {
      await service.requestAccess();
      const onMidiMessage = mockInput.onmidimessage;

      onMidiMessage({ data: [0x90, 60, 100] });

      onMidiMessage({ data: [0x90, 60, 0] });

      expect(service.activeMidiNotes().has(60)).toBe(false);
      expect(audioServiceSpy.releaseNote).toHaveBeenCalledWith(60);
    });

    it('should ignore short messages', async () => {
      await service.requestAccess();
      const onMidiMessage = mockInput.onmidimessage;

      onMidiMessage({ data: [0x90, 60] });

      expect(service.activeMidiNotes().size).toBe(0);
      expect(audioServiceSpy.playNote).not.toHaveBeenCalled();
    });
  });
});
