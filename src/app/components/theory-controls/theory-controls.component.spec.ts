import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TheoryControlsComponent } from './theory-controls.component';
import { TheoryService } from '../../services/theory.service';

describe('TheoryControlsComponent', () => {
  let component: TheoryControlsComponent;
  let fixture: ComponentFixture<TheoryControlsComponent>;
  let mockTheoryService: any;

  beforeEach(async () => {
    // Create a mock TheoryService
    mockTheoryService = {
      language: signal('en'),
      progressions: [
        { name: 'Prog 1' },
        { name: 'Prog 2' }
      ],
      getNoteColor: vi.fn().mockReturnValue('#ff0000') // Vitest spy
    };

    await TestBed.configureTestingModule({
      imports: [TheoryControlsComponent],
      providers: [
        { provide: TheoryService, useValue: mockTheoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TheoryControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return English label when language is "en"', () => {
    mockTheoryService.language.set('en');
    expect(component.detectedLabel()).toBe('C Major (Demo)');
  });

  it('should return Spanish label when language is "es"', () => {
    mockTheoryService.language.set('es');
    expect(component.detectedLabel()).toBe('Do Mayor (Demo)');
  });

  it('should call getNoteColor with 60 and return the expected color', () => {
    const color = component.detectedColor();
    expect(mockTheoryService.getNoteColor).toHaveBeenCalledWith(60);
    expect(color).toBe('#ff0000');
  });

  it('should handle selectProgression event without crashing', () => {
    const mockEvent = {
      target: { value: 'Prog 1' }
    } as unknown as Event;

    // As it does not return anything or change state yet, we just verify it doesn't throw
    expect(() => component.selectProgression(mockEvent)).not.toThrow();
  });
});
