import { TestBed } from '@angular/core/testing';
import { MidiApiService } from './midi-api.service';
import { AudioService } from './audio.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MidiApiService', () => {
  let service: MidiApiService;
  let audioServiceSpy: any;

  beforeEach(() => {
    const spy = {
      playNote: vi.fn(),
      releaseNote: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        MidiApiService,
        { provide: AudioService, useValue: spy }
      ]
    });
    service = TestBed.inject(MidiApiService);
    audioServiceSpy = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle requestAccess rejection', async () => {
    // Mock navigator.requestMIDIAccess to reject
    const mockError = new Error('Access Denied');
    const originalRequestMIDIAccess = navigator.requestMIDIAccess;

    // @ts-ignore
    navigator.requestMIDIAccess = vi.fn().mockRejectedValue(mockError);

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error');

    await service.requestAccess();

    expect(navigator.requestMIDIAccess).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('MIDI Access denied or failed', mockError);
    expect(service.isConnected()).toBe(false);

    // Restore original
    // @ts-ignore
    navigator.requestMIDIAccess = originalRequestMIDIAccess;
  });
});
