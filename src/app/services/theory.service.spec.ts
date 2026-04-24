import { TestBed } from '@angular/core/testing';
import { TheoryService } from './theory.service';
import { vi } from 'vitest';

describe('TheoryService', () => {
  let service: TheoryService;
  let mockStorage: { [key: string]: string };

  beforeEach(() => {
    mockStorage = {};

    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
      return key in mockStorage ? mockStorage[key] : null;
    });

    vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [TheoryService]
    });
    service = TestBed.inject(TheoryService);
  });

  it('should be created with default values', () => {
    expect(service).toBeTruthy();
    expect(service.language()).toBe('en');
    expect(service.theme()).toBe('dark');
    expect(service.showOnPiano()).toBeFalsy();
  });

  it('should toggle language', () => {
    expect(service.language()).toBe('en');
    service.toggleLanguage();
    expect(service.language()).toBe('es');
    service.toggleLanguage();
    expect(service.language()).toBe('en');
  });

  it('should toggle theme', () => {
    expect(service.theme()).toBe('dark');
    service.toggleTheme();
    expect(service.theme()).toBe('light');
    service.toggleTheme();
    expect(service.theme()).toBe('dark');
  });

  describe('getNoteName', () => {
    it('should return correct note names in English', () => {
      service.language.set('en');
      expect(service.getNoteName(60)).toBe('C');
      expect(service.getNoteName(61)).toBe('C#');
      expect(service.getNoteName(71)).toBe('B');
    });

    it('should return correct note names in Spanish', () => {
      service.language.set('es');
      expect(service.getNoteName(60)).toBe('Do');
      expect(service.getNoteName(61)).toBe('Do#');
      expect(service.getNoteName(71)).toBe('Si');
    });
  });

  describe('getNoteColor', () => {
    it('should return consistent colors based on modulo 12', () => {
      const color60 = service.getNoteColor(60);
      const color72 = service.getNoteColor(72);
      expect(color60).toBe(color72);
      expect(color60).toBe('#e74c3c');
    });
  });

  describe('getOctave', () => {
    it('should return correct octave', () => {
      expect(service.getOctave(60)).toBe(4); // 60/12 - 1 = 4
      expect(service.getOctave(12)).toBe(0);
      expect(service.getOctave(72)).toBe(5);
    });
  });

  describe('getChordNames', () => {
    it('should return chord names in English', () => {
      service.selectedChordId.set('maj');
      const { rootName, chordName } = service.getChordNames(0, 'en'); // rootIdx 0 is C
      expect(rootName).toBe('C');
      expect(chordName).toBe('C Major');
    });

    it('should return chord names in Spanish', () => {
      service.selectedChordId.set('min');
      const { rootName, chordName } = service.getChordNames(2, 'es'); // rootIdx 2 is Re
      expect(rootName).toBe('Re');
      expect(chordName).toBe('Re Menor');
    });
  });

  describe('getNoteLibrary', () => {
    it('should return correct library based on language', () => {
      const enLib = service.getNoteLibrary('en');
      expect(enLib[0]).toBe('C');

      const esLib = service.getNoteLibrary('es');
      expect(esLib[0]).toBe('Do');
    });
  });

  describe('loadPref', () => {
    it('should return default value if localStorage has corrupted JSON', () => {
      // Mock localStorage to return corrupted JSON just for the 'language' key
      vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
        if (key === 'piano_tool_language') {
          return '"{bad json"';
        }
        return null;
      });

      // The service needs to be re-injected so the class properties are initialized
      // with the mocked localStorage above
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [TheoryService]
      });
      const newService = TestBed.inject(TheoryService);

      // The default for 'language' is 'en'
      expect(newService.language()).toBe('en');
    });
  });

  describe('activeTheoryNotes', () => {
    it('should return empty array if showOnPiano is false', () => {
      service.showOnPiano.set(false);
      expect(service.activeTheoryNotes()).toEqual([]);
    });

    it('should return correct midi numbers for a major chord', () => {
      service.showOnPiano.set(true);
      service.selectedRootIndex.set(0); // C
      service.selectedChordId.set('maj');

      const notes = service.activeTheoryNotes();
      expect(notes).toEqual([60, 64, 67]); // C(60) E(64) G(67)
    });

    it('should return correct midi numbers for a minor 7 chord', () => {
      service.showOnPiano.set(true);
      service.selectedRootIndex.set(2); // D
      service.selectedChordId.set('min7');

      const notes = service.activeTheoryNotes();
      expect(notes).toEqual([62, 65, 69, 72]); // D(62) F(65) A(69) C(72)
    });

    it('should return empty array if chord id is invalid', () => {
      service.showOnPiano.set(true);
      service.selectedChordId.set('invalid-chord');
      expect(service.activeTheoryNotes()).toEqual([]);
    });
  });
});
