import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { TheoryControlsComponent } from './theory-controls.component';
import { TheoryService } from '../../services/theory.service';

describe('TheoryControlsComponent', () => {
  let component: TheoryControlsComponent;
  let fixture: ComponentFixture<TheoryControlsComponent>;
  let mockTheoryService: any;

  beforeEach(async () => {
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

  it('should return English and Spanish labels', () => {
    mockTheoryService.language.set('en');
    fixture.detectChanges();
    expect(component.detectedLabel()).toBe('C Major (Demo)');

    mockTheoryService.language.set('es');
    fixture.detectChanges();
    expect(component.detectedLabel()).toBe('Do Mayor (Demo)');
  });

  it('should call getNoteColor with 60', () => {
    expect(component.detectedColor()).toBe('#e74c3c');
    expect(mockTheoryService.getNoteColor).toHaveBeenCalledWith(60);
  });

  it('should handle selectProgression event', () => {
    const event = { target: { value: 'I-V-vi-IV (C)' } } as unknown as Event;
    expect(() => component.selectProgression(event)).not.toThrow();
  });

  it('should render localized labels and progressions', () => {
    mockTheoryService.language.set('en');
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Theory Engine');

    mockTheoryService.language.set('es');
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Motor de Teoría');

    const options = compiled.querySelectorAll('option');
    expect(options.length).toBe(3);
  });
});
