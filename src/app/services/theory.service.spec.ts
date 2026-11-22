import { TestBed } from '@angular/core/testing';
import { TheoryService } from './theory.service';
import { vi } from 'vitest';

describe('TheoryService', () => {
  let service: TheoryService;
  let mockStorage: { [key: string]: string };

  beforeEach(() => {
    mockStorage = {};
    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) =>
      key in mockStorage ? mockStorage[key] : null
    );
    vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      mockStorage[key] = value;
    });
    TestBed.configureTestingModule({ providers: [TheoryService] });
    service = TestBed.inject(TheoryService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created with default values', () => {
    expect(service).toBeTruthy();
    expect(service.language()).toBe('en');
    expect(service.theme()).toBe('dark');
    expect(service.showOnPiano()).toBeFalsy();
  });

  it('should toggle language and theme', () => {
    service.toggleLanguage();
    expect(service.language()).toBe('es');
    service.toggleTheme();
    expect(service.theme()).toBe('light');
  });

  it('should return note names in English and Spanish', () => {
    service.language.set('en');
    expect(service.getNoteName(60)).toBe('C');
    service.language.set('es');
    expect(service.getNoteName(60)).toBe('Do');
  });

  it('should return consistent note colors', () => {
    expect(service.getNoteColor(60)).toBe('#e74c3c');
    expect(service.getNoteColor(72)).toBe('#e74c3c');
  });

  it('should handle negative MIDI values gracefully', () => {
    expect(service.getNoteColor(-1)).toBeUndefined();
  });

  it('should return correct octaves', () => {
    expect(service.getOctave(60)).toBe(4);
    expect(service.getOctave(12)).toBe(0);
    expect(service.getOctave(72)).toBe(5);
  });

  it('should return chord names in English and Spanish', () => {
    service.selectedChordId.set('maj');
    expect(service.getChordNames(0, 'en')).toEqual({ rootName: 'C', chordName: 'C Major' });
    service.selectedChordId.set('min');
    expect(service.getChordNames(2, 'es')).toEqual({ rootName: 'Re', chordName: 'Re Menor' });
  });

  it('should return the correct note library', () => {
    expect(service.getNoteLibrary('en')[0]).toBe('C');
    expect(service.getNoteLibrary('es')[0]).toBe('Do');
  });

  it('should calculate active theory notes', () => {
    service.showOnPiano.set(true);
    service.selectedRootIndex.set(0);
    service.selectedChordId.set('maj');
    expect(service.activeTheoryNotes()).toEqual([60, 64, 67]);

    service.selectedRootIndex.set(2);
    service.selectedChordId.set('min7');
    expect(service.activeTheoryNotes()).toEqual([62, 65, 69, 72]);
  });

  it('should return no active notes for an invalid chord', () => {
    service.showOnPiano.set(true);
    service.selectedChordId.set('invalid-chord');
    expect(service.activeTheoryNotes()).toEqual([]);
  });
});
