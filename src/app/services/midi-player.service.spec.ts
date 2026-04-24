import { TestBed } from '@angular/core/testing';
import { MidiPlayerService, ParsedMidiState } from './midi-player.service';
import { AudioService } from './audio.service';
import { signal } from '@angular/core';

// Completely mock tone to avoid trying to spy on real methods that might not be configurable.
const mockTransport = {
  start: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  cancel: vi.fn(),
  seconds: 0
};

vi.mock('tone', () => {
  return {
    getTransport: () => mockTransport,
    Part: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      dispose: vi.fn(),
      playbackRate: 1.0
    })),
    Draw: {
      schedule: vi.fn()
    }
  };
});

describe('MidiPlayerService', () => {
  let service: MidiPlayerService;
  let audioServiceSpy: any;

  beforeEach(() => {
    audioServiceSpy = {
      ensureContext: vi.fn().mockResolvedValue(undefined),
      triggerAttackRelease: vi.fn(),
      playNote: vi.fn(),
      releaseNote: vi.fn(),
      releaseAll: vi.fn(),
      switchPreset: vi.fn(),
      selectedPreset: signal('grand-piano')
    };

    // Reset transport mocks
    mockTransport.start.mockClear();
    mockTransport.pause.mockClear();
    mockTransport.stop.mockClear();
    mockTransport.cancel.mockClear();
    mockTransport.seconds = 0;

    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        MidiPlayerService,
        { provide: AudioService, useValue: audioServiceSpy }
      ]
    });
    service = TestBed.inject(MidiPlayerService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should be created and have initial state', () => {
    expect(service).toBeTruthy();
    expect(service.isPlaying()).toBe(false);
    expect(service.isPracticeMode()).toBe(false);
    expect(service.practiceSteps()).toEqual([]);
    expect(service.currentStepIndex()).toBe(0);
    expect(service.playLH()).toBe(true);
    expect(service.playRH()).toBe(true);
  });

  describe('generatePracticeSteps', () => {
    it('should handle standard split (1 track)', () => {
      const mockMidi: ParsedMidiState = {
        tracks: [
          {
            notes: [
              { midi: 59, time: 0 }, // LH (< 60)
              { midi: 60, time: 1 }  // RH (>= 60)
            ]
          }
        ],
        duration: 2
      };

      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(2);
      expect(steps[0].notes[0].hand).toBe('lh');
      expect(steps[0].notes[0].midi).toBe(59);
      expect(steps[1].notes[0].hand).toBe('rh');
      expect(steps[1].notes[0].midi).toBe(60);
    });

    it('should handle non-standard split (2 tracks)', () => {
      const mockMidi: ParsedMidiState = {
        tracks: [
          {
            notes: [
              { midi: 60, time: 0 } // RH (track 0)
            ]
          },
          {
            notes: [
              { midi: 50, time: 1 } // LH (track 1)
            ]
          }
        ],
        duration: 2
      };

      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(2);
      expect(steps[0].notes[0].hand).toBe('rh');
      expect(steps[1].notes[0].hand).toBe('lh');
    });

    it('should filter by playLH and playRH', () => {
      const mockMidi: ParsedMidiState = {
        tracks: [
          {
            notes: [
              { midi: 59, time: 0 }, // LH
              { midi: 60, time: 1 }  // RH
            ]
          }
        ],
        duration: 2
      };

      service.currentMidi.set(mockMidi);

      service.playLH.set(false);
      service.generatePracticeSteps();
      expect(service.practiceSteps().length).toBe(1);
      expect(service.practiceSteps()[0].notes[0].hand).toBe('rh');

      service.playLH.set(true);
      service.playRH.set(false);
      service.generatePracticeSteps();
      expect(service.practiceSteps().length).toBe(1);
      expect(service.practiceSteps()[0].notes[0].hand).toBe('lh');
    });

    it('should sort notes by time then pitch', () => {
      const mockMidi: ParsedMidiState = {
        tracks: [
          {
            notes: [
              { midi: 62, time: 1 },
              { midi: 60, time: 1 },
              { midi: 58, time: 0 }
            ]
          }
        ],
        duration: 2
      };
      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(3);
      expect(steps[0].time).toBe(0);
      expect(steps[0].notes[0].midi).toBe(58);

      expect(steps[1].time).toBe(1);
      expect(steps[1].notes[0].midi).toBe(60);

      expect(steps[2].time).toBe(1);
      expect(steps[2].notes[0].midi).toBe(62);
    });
  });

  describe('onUserNotePress & advancePractice', () => {
    beforeEach(() => {
      const mockMidi: ParsedMidiState = {
        tracks: [
          {
            notes: [
              { midi: 60, time: 0 },
              { midi: 62, time: 1 }
            ]
          }
        ],
        duration: 2
      };
      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();
    });

    it('should do nothing if not in practice mode', () => {
      service.isPracticeMode.set(false);
      service.onUserNotePress(60);
      expect(service.currentStepIndex()).toBe(0);
    });

    it('should advance practice if correct note pressed in practice mode', () => {
      service.isPracticeMode.set(true);
      expect(service.currentStepIndex()).toBe(0);
      expect(service.targetNotes()[0].midi).toBe(60);

      service.onUserNotePress(60);
      expect(service.currentStepIndex()).toBe(1);
      expect(service.currentlyPlayingNotes().has(60)).toBe(true);

      vi.advanceTimersByTime(200); // Visual note timeout
      expect(service.currentlyPlayingNotes().has(60)).toBe(false);
    });

    it('should loop index back to 0 when reaching the end', () => {
      service.isPracticeMode.set(true);
      service.onUserNotePress(60); // idx 0 -> 1
      service.onUserNotePress(62); // idx 1 -> 0
      expect(service.currentStepIndex()).toBe(0);
    });
  });

  describe('playback controls', () => {
    it('play() should set isPlaying to true and start transport', async () => {
      expect(service.isPlaying()).toBe(false);
      await service.play();
      expect(service.isPlaying()).toBe(true);
      expect(audioServiceSpy.ensureContext).toHaveBeenCalled();
      expect(mockTransport.start).toHaveBeenCalledWith("+0.1");
    });

    it('pause() should set isPlaying to false and pause transport', () => {
      service.isPlaying.set(true);
      service.pause();
      expect(service.isPlaying()).toBe(false);
      expect(mockTransport.pause).toHaveBeenCalled();
    });

    it('stop() should reset state and stop transport', () => {
      service.isPlaying.set(true);
      service.currentStepIndex.set(5);
      service.currentlyPlayingNotes.set(new Map([[60, 'rh']]));

      service.stop();

      expect(service.isPlaying()).toBe(false);
      expect(service.currentStepIndex()).toBe(0);
      expect(service.currentlyPlayingNotes().size).toBe(0);
      expect(mockTransport.stop).toHaveBeenCalled();
      expect(mockTransport.seconds).toBe(0);
    });

    it('clearPlayback() should cancel transport and dispose parts', () => {
      service.clearPlayback();
      expect(mockTransport.stop).toHaveBeenCalled();
      expect(mockTransport.cancel).toHaveBeenCalledWith(0);
    });

    it('setPlaybackRate() should update rate signal and parts', () => {
      service.setPlaybackRate(1.5);
      expect(service.playbackRate()).toBe(1.5);
    });
  });
});
