import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TheoryControlsComponent } from './theory-controls.component';
import { TheoryService } from '../../services/theory.service';
import { signal } from '@angular/core';

describe('TheoryControlsComponent', () => {
  let component: TheoryControlsComponent;
  let fixture: ComponentFixture<TheoryControlsComponent>;
  let mockTheoryService: any;

  beforeEach(async () => {
    // Create a mock TheoryService
    mockTheoryService = {
      language: signal('en'),
      progressions: [
        { name: 'I-V-vi-IV (C)' },
        { name: 'ii-V-I (C)' }
      ],
      getNoteColor: vi.fn().mockReturnValue('#e74c3c')
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

  describe('detectedLabel', () => {
    it('should return English label when language is en', () => {
      mockTheoryService.language.set('en');
      fixture.detectChanges();
      expect(component.detectedLabel()).toBe('C Major (Demo)');
    });

    it('should return Spanish label when language is es', () => {
      mockTheoryService.language.set('es');
      fixture.detectChanges();
      expect(component.detectedLabel()).toBe('Do Mayor (Demo)');
    });
  });

  describe('detectedColor', () => {
    it('should call getNoteColor with 60 and return the color', () => {
      const color = component.detectedColor();
      expect(mockTheoryService.getNoteColor).toHaveBeenCalledWith(60);
      expect(color).toBe('#e74c3c');
    });
  });

  describe('selectProgression', () => {
    it('should execute without errors', () => {
      const event = { target: { value: 'I-V-vi-IV (C)' } } as unknown as Event;
      expect(() => component.selectProgression(event)).not.toThrow();
    });
  });

  describe('template rendering', () => {
    it('should render English texts when language is en', () => {
      mockTheoryService.language.set('en');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h3')?.textContent).toContain('Theory Engine');
      expect(compiled.querySelector('label')?.textContent).toContain('Progression:');
      expect(compiled.querySelector('.detected-chord p')?.textContent).toContain('Detected chord:');
    });

    it('should render Spanish texts when language is es', () => {
      mockTheoryService.language.set('es');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h3')?.textContent).toContain('Motor de Teoría');
      expect(compiled.querySelector('label')?.textContent).toContain('Progresión:');
      expect(compiled.querySelector('.detected-chord p')?.textContent).toContain('Acorde detectado:');
    });

    it('should render the list of progressions', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const options = compiled.querySelectorAll('option');
      // 1 default option + 2 mock progressions
      expect(options.length).toBe(3);
      expect(options[1].value).toBe('I-V-vi-IV (C)');
      expect(options[1].textContent).toBe('I-V-vi-IV (C)');
      expect(options[2].value).toBe('ii-V-I (C)');
      expect(options[2].textContent).toBe('ii-V-I (C)');
    });
  });
});
