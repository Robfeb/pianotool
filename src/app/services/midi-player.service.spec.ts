import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MidiPlayerService } from './midi-player.service';
import { AudioService } from './audio.service';
import { Midi } from '@tonejs/midi';

// Mock Midi
vi.mock('@tonejs/midi', () => {
  return {
    Midi: vi.fn().mockImplementation(function() {
      return {
        tracks: [],
        duration: 10
      };
    })
  };
});

// Mock Tone
vi.mock('tone', () => {
  return {
    getTransport: () => ({
      stop: vi.fn(),
      cancel: vi.fn(),
      seconds: 0
    })
  };
});

describe('MidiPlayerService', () => {
  let service: MidiPlayerService;
  let audioServiceSpy: any;

  beforeEach(() => {
    audioServiceSpy = {
      ensureContext: vi.fn().mockResolvedValue(undefined),
      triggerAttackRelease: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        MidiPlayerService,
        { provide: AudioService, useValue: audioServiceSpy }
      ]
    });
    service = TestBed.inject(MidiPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadFile', () => {
    let mockFile: File;
    let mockFileReader: any;
    let fileReaderInstance: any;

    beforeEach(() => {
      mockFile = new File(['dummy content'], 'test-song.mid', { type: 'audio/midi' });

      fileReaderInstance = {
        readAsArrayBuffer: function(this: any, file: File) {
          if (this.onload) {
            this.onload({
              target: {
                result: new ArrayBuffer(8)
              }
            });
          }
        },
        onload: null
      };

      mockFileReader = vi.spyOn(globalThis, 'FileReader').mockImplementation(function() {
        return fileReaderInstance;
      } as unknown as () => FileReader);

      // Spy on the method generatePracticeSteps
      vi.spyOn(service, 'generatePracticeSteps').mockImplementation(() => {});
      vi.spyOn(service, 'stop').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should correctly parse the file and update state', async () => {
      // Let's call loadFile and wait for it
      await service.loadFile(mockFile);

      // It should load the audio context
      expect(audioServiceSpy.ensureContext).toHaveBeenCalled();

      // It should update currentFileName with stripped extension
      expect(service.currentFileName()).toBe('test-song');

      // It should update currentMidi with tracks and duration from the Mocked Midi
      expect(service.currentMidi()).toEqual({
        tracks: [],
        duration: 10
      });

      // It should generate practice steps
      expect(service.generatePracticeSteps).toHaveBeenCalled();
    });

  });
});
