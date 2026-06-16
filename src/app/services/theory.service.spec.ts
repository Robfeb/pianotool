import { TestBed } from '@angular/core/testing';
import { TheoryService } from './theory.service';

describe('TheoryService', () => {
  let service: TheoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TheoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOctave', () => {
    it('should return 4 for middle C (MIDI 60)', () => {
      expect(service.getOctave(60)).toBe(4);
    });

    it('should return -1 for C-1 (MIDI 0)', () => {
      expect(service.getOctave(0)).toBe(-1);
    });

    it('should return 9 for G9 (MIDI 127)', () => {
      expect(service.getOctave(127)).toBe(9);
    });

    it('should return the correct octave for non-root notes (e.g., F4 -> MIDI 65)', () => {
      expect(service.getOctave(65)).toBe(4);
    });

    it('should return the correct octave for non-root notes (e.g., C#4 -> MIDI 61)', () => {
      expect(service.getOctave(61)).toBe(4);
    });

    it('should return 3 for B3 (MIDI 59)', () => {
      expect(service.getOctave(59)).toBe(3);
    });
  });
});
