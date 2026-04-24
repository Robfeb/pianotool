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
    it('should return the correct color for standard MIDI notes', () => {
      // Middle C (MIDI 60), 60 % 12 = 0 -> NOTE_COLORS[0]
      expect(service.getNoteColor(60)).toBe('#e74c3c');
      // A4 (MIDI 69), 69 % 12 = 9 -> NOTE_COLORS[9]
      expect(service.getNoteColor(69)).toBe('#8e44ad');
    });

    it('should return correct colors for a full octave (0-11)', () => {
      const expectedColors = [
        '#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#1abc9c',
        '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#e91e63', '#c0392b'
      ];
      for (let i = 0; i < 12; i++) {
        expect(service.getNoteColor(i)).toBe(expectedColors[i]);
      }
    });

    it('should handle typical MIDI boundary values correctly', () => {
      // Lowest MIDI note (0)
      expect(service.getNoteColor(0)).toBe('#e74c3c');
      // Highest MIDI note (127), 127 % 12 = 7 -> NOTE_COLORS[7]
      expect(service.getNoteColor(127)).toBe('#2980b9');
    });

    it('should handle negative MIDI values gracefully', () => {
      // While MIDI notes are typically 0-127, it's good practice to ensure modulo logic handles unexpected input if possible.
      // JS modulo operator (%) retains the sign of the dividend.
      // -1 % 12 is -1. This would access undefined in the array.
      // The current implementation `return this.NOTE_COLORS[midiNumber % 12];` will return undefined for negative numbers if not handled.
      // Let's test the current behavior, which returns undefined for negative inputs (since arrays don't have negative indices by default).
      expect(service.getNoteColor(-1)).toBeUndefined();
    });
  });
});
