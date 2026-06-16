import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TheoryComponent } from './theory.component';
import { TheoryService } from '../../services/theory.service';
import { signal } from '@angular/core';

describe('TheoryComponent', () => {
  let component: TheoryComponent;
  let fixture: ComponentFixture<TheoryComponent>;
  let mockTheoryService: any;

  beforeEach(async () => {
    mockTheoryService = {
      showOnPiano: signal(false),
      language: signal('en'),
      selectedRootIndex: signal(0),
      selectedChordId: signal('maj'),
      activeTheoryNotes: signal([60, 64, 67]), // C Major
      CHORD_DEFINITIONS: [
        { id: 'maj', nameEn: 'Major', nameEs: 'Mayor', intervalsEn: ['Root', 'M3', 'P5'], intervalsEs: ['Tónica', '3M', '5P'] }
      ],
      getNoteLibrary: vi.fn().mockReturnValue(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']),
      getChordNames: vi.fn().mockReturnValue({ rootName: 'C', chordName: 'C Major' }),
      getNoteName: vi.fn().mockImplementation((midi) => {
        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return names[midi % 12];
      })
    };

    await TestBed.configureTestingModule({
      imports: [TheoryComponent],
      providers: [
        { provide: TheoryService, useValue: mockTheoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TheoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle piano show correctly', () => {
    expect(mockTheoryService.showOnPiano()).toBe(false);
    component.togglePianoShow();
    expect(mockTheoryService.showOnPiano()).toBe(true);
    component.togglePianoShow();
    expect(mockTheoryService.showOnPiano()).toBe(false);
  });

  it('should get chord label', () => {
    expect(component.getChordLabel()).toBe('C Major');
    expect(mockTheoryService.getChordNames).toHaveBeenCalledWith(0, 'en');
  });

  it('should get note list', () => {
    expect(component.getNoteList()).toBe('C - E - G');
  });

  it('should get formula', () => {
    expect(component.getFormula()).toBe('Root - M3 - P5');

    mockTheoryService.language.set('es');
    fixture.detectChanges();
    expect(component.getFormula()).toBe('Tónica - 3M - 5P');
  });
});
