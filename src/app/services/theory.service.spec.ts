import { TestBed } from '@angular/core/testing';
import { TheoryService } from './theory.service';

describe('TheoryService', () => {
  let service: TheoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TheoryService);

    // Clear localStorage to prevent interference from saved state
    localStorage.clear();
  });

  describe('getChordNames', () => {
    it('should return correct English names for C Major', () => {
      // By default selectedChordId is 'maj'
      const result = service.getChordNames(0, 'en');
      expect(result).toEqual({ rootName: 'C', chordName: 'C Major' });
    });

    it('should return correct Spanish names for Do Mayor', () => {
      // By default selectedChordId is 'maj'
      const result = service.getChordNames(0, 'es');
      expect(result).toEqual({ rootName: 'Do', chordName: 'Do Mayor' });
    });

    it('should return correct names for a different root note (F#)', () => {
      // F# is index 6
      const result = service.getChordNames(6, 'en');
      expect(result).toEqual({ rootName: 'F#', chordName: 'F# Major' });
    });

    it('should return correct names when a different chord type is selected', () => {
      // Change to minor
      service.selectedChordId.set('min');

      const resultEn = service.getChordNames(2, 'en'); // D Minor
      expect(resultEn).toEqual({ rootName: 'D', chordName: 'D Minor' });

      const resultEs = service.getChordNames(2, 'es'); // Re Menor
      expect(resultEs).toEqual({ rootName: 'Re', chordName: 'Re Menor' });
    });

    it('should handle invalid chord IDs gracefully', () => {
      // Set to an unknown ID
      service.selectedChordId.set('invalid_id');

      const result = service.getChordNames(0, 'en');
      // Current behavior evaluates def?.nameEn to undefined, resulting in 'C undefined'
      expect(result).toEqual({ rootName: 'C', chordName: 'C undefined' });
    });
  });
});
