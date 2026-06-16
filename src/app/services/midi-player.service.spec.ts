import { TestBed } from '@angular/core/testing';
import { MidiPlayerService, ParsedMidiState } from './midi-player.service';
import { AudioService } from './audio.service';
import { vi } from 'vitest';

describe('MidiPlayerService', () => {
  let service: MidiPlayerService;
  let mockAudioService: any;

  beforeEach(() => {
    mockAudioService = {
      ensureContext: vi.fn().mockResolvedValue(undefined),
      triggerAttackRelease: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        MidiPlayerService,
        { provide: AudioService, useValue: mockAudioService }
      ]
    });
    service = TestBed.inject(MidiPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generatePracticeSteps', () => {
    it('should return early if currentMidi is null', () => {
      service.currentMidi.set(null);
      service.generatePracticeSteps();
      expect(service.practiceSteps()).toEqual([]);
    });

    it('should apply standard hand split (>=60 is RH, <60 is LH) when active tracks !== 2', () => {
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
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(2);
      expect(steps[0].notes[0]).toEqual({ midi: 59, hand: 'lh' });
      expect(steps[1].notes[0]).toEqual({ midi: 60, hand: 'rh' });
    });

    it('should apply track-based hand split when active tracks === 2', () => {
      const mockMidi: ParsedMidiState = {
        tracks: [
          { notes: [{ midi: 60, time: 0 }] }, // Track 0 -> RH
          { notes: [{ midi: 60, time: 1 }] }  // Track 1 -> LH
        ],
        duration: 2
      };
      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(2);
      expect(steps[0].notes[0]).toEqual({ midi: 60, hand: 'rh' });
      expect(steps[1].notes[0]).toEqual({ midi: 60, hand: 'lh' });
    });

    it('should filter out Left Hand notes when playLH is false', () => {
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
      service.playLH.set(false);
      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(1);
      expect(steps[0].notes[0]).toEqual({ midi: 60, hand: 'rh' });
    });

    it('should filter out Right Hand notes when playRH is false', () => {
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
      service.playRH.set(false);
      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(1);
      expect(steps[0].notes[0]).toEqual({ midi: 59, hand: 'lh' });
    });

    it('should sort notes by time then by pitch', () => {
      const mockMidi: ParsedMidiState = {
        tracks: [
          {
            notes: [
              { midi: 62, time: 1 }, // later time
              { midi: 60, time: 0 }, // same time, higher pitch
              { midi: 58, time: 0 }  // same time, lower pitch
            ]
          }
        ],
        duration: 2
      };
      service.currentMidi.set(mockMidi);
      service.generatePracticeSteps();

      const steps = service.practiceSteps();
      expect(steps.length).toBe(3);
      expect(steps[0].notes[0].midi).toBe(58); // time 0, pitch 58
      expect(steps[1].notes[0].midi).toBe(60); // time 0, pitch 60
      expect(steps[2].notes[0].midi).toBe(62); // time 1, pitch 62
    });
  });
});
