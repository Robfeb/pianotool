import { TestBed } from '@angular/core/testing';
import { MidiPlayerService, PracticeStep } from './midi-player.service';
import { AudioService } from './audio.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('MidiPlayerService', () => {
  let service: MidiPlayerService;
  let audioServiceMock: any;

  beforeEach(() => {
    audioServiceMock = {
      ensureContext: vi.fn().mockResolvedValue(undefined),
      triggerAttackRelease: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        MidiPlayerService,
        { provide: AudioService, useValue: audioServiceMock }
      ]
    });
    service = TestBed.inject(MidiPlayerService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('onUserNotePress', () => {
    it('should do nothing if not in practice mode', () => {
      service.isPracticeMode.set(false);
      vi.spyOn(service, 'advancePractice');

      service.onUserNotePress(60);

      expect(service.advancePractice).not.toHaveBeenCalled();
    });

    it('should do nothing if targetNotes is empty', () => {
      service.isPracticeMode.set(true);
      service.practiceSteps.set([]);
      vi.spyOn(service, 'advancePractice');

      service.onUserNotePress(60);

      expect(service.advancePractice).not.toHaveBeenCalled();
    });

    it('should do nothing if pressed note does not match target note', () => {
      service.isPracticeMode.set(true);
      service.practiceSteps.set([{ time: 0, notes: [{ midi: 62, hand: 'rh' }] }]);
      service.currentStepIndex.set(0);
      vi.spyOn(service, 'advancePractice');

      service.onUserNotePress(60); // Press C4, target is D4

      expect(service.advancePractice).not.toHaveBeenCalled();
    });

    it('should update visual note and advance practice when correct note is pressed', () => {
      service.isPracticeMode.set(true);
      service.practiceSteps.set([
        { time: 0, notes: [{ midi: 60, hand: 'rh' }] },
        { time: 1, notes: [{ midi: 62, hand: 'rh' }] }
      ]);
      service.currentStepIndex.set(0);
      vi.spyOn(service, 'advancePractice');

      expect(service.currentlyPlayingNotes().has(60)).toBe(false);

      service.onUserNotePress(60);

      // Note should be visually playing
      expect(service.currentlyPlayingNotes().get(60)).toBe('rh');
      expect(service.advancePractice).toHaveBeenCalled();

      // Fast forward 200ms
      vi.advanceTimersByTime(200);

      // Note should stop visually playing
      expect(service.currentlyPlayingNotes().has(60)).toBe(false);
    });
  });

  describe('advancePractice', () => {
    it('should increment currentStepIndex if there are more steps', () => {
      service.practiceSteps.set([
        { time: 0, notes: [{ midi: 60, hand: 'rh' }] },
        { time: 1, notes: [{ midi: 62, hand: 'rh' }] }
      ]);
      service.currentStepIndex.set(0);

      service.advancePractice();

      expect(service.currentStepIndex()).toBe(1);
    });

    it('should wrap around to 0 when reaching the end of steps', () => {
      service.practiceSteps.set([
        { time: 0, notes: [{ midi: 60, hand: 'rh' }] },
        { time: 1, notes: [{ midi: 62, hand: 'rh' }] }
      ]);
      service.currentStepIndex.set(1); // On last step

      service.advancePractice();

      expect(service.currentStepIndex()).toBe(0);
    });
  });
});
