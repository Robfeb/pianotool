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

  describe('getNoteColor', () => {
    it('should return the correct color for MIDI number 0', () => {
      expect(service.getNoteColor(0)).toBe('#e74c3c');
    });

    it('should return the correct color for MIDI number 11', () => {
      expect(service.getNoteColor(11)).toBe('#c0392b');
    });

    it('should return the correct color for MIDI number 12 (same as 0)', () => {
      expect(service.getNoteColor(12)).toBe('#e74c3c');
    });

    it('should return the correct color for a high MIDI number (e.g., 60 - Middle C)', () => {
      expect(service.getNoteColor(60)).toBe('#e74c3c');
    });

    it('should return the correct color for an arbitrary MIDI number within an octave (e.g., 65 - F)', () => {
      // 65 % 12 = 5 -> NOTE_COLORS[5] = '#1abc9c'
      expect(service.getNoteColor(65)).toBe('#1abc9c');
    });
  });
});
