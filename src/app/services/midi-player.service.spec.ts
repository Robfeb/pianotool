import { TestBed } from '@angular/core/testing';
import { MidiPlayerService, ParsedMidiState } from './midi-player.service';
import { AudioService } from './audio.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

vi.mock('@tonejs/midi', () => ({
  Midi: vi.fn().mockImplementation(function() {
    return { tracks: [], duration: 10 };
  })
}));

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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate practice steps with standard hand split', () => {
    service.currentMidi.set({
      tracks: [{ notes: [{ midi: 59, time: 0 }, { midi: 60, time: 1 }] }],
      duration: 2
    } as ParsedMidiState);
    service.generatePracticeSteps();
    expect(service.practiceSteps()[0].notes[0]).toEqual({ midi: 59, hand: 'lh' });
    expect(service.practiceSteps()[1].notes[0]).toEqual({ midi: 60, hand: 'rh' });
  });

  it('should advance and reset practice mode', () => {
    service.practiceSteps.set([
      { time: 0, notes: [{ midi: 60, hand: 'rh' }] },
      { time: 1, notes: [{ midi: 62, hand: 'rh' }] }
    ]);
    service.isPracticeMode.set(true);
    service.onUserNotePress(60);
    expect(service.currentStepIndex()).toBe(1);
  });

});
