import { describe, it, expect, beforeEach, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetronomeComponent } from './metronome.component';
import { MetronomeService } from '../../services/metronome.service';
import { TheoryService } from '../../services/theory.service';
import { signal } from '@angular/core';

describe('MetronomeComponent', () => {
  let component: MetronomeComponent;
  let fixture: ComponentFixture<MetronomeComponent>;

  let metronomeServiceMock: any;
  let theoryServiceMock: any;

  beforeEach(async () => {
    metronomeServiceMock = {
      bpm: signal(120),
      isPlaying: signal(false),
      accentEnabled: signal(true),
      beatsPerMeasure: signal(4),
      currentBeatIndex: signal(-1),
      toggle: vi.fn(),
      setBpm: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };

    theoryServiceMock = {
      language: signal('en')
    };

    await TestBed.configureTestingModule({
      imports: [MetronomeComponent],
      providers: [
        { provide: MetronomeService, useValue: metronomeServiceMock },
        { provide: TheoryService, useValue: theoryServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetronomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title for English', () => {
    theoryServiceMock.language.set('en');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Metronome');
  });

  it('should display the correct title for Spanish', () => {
    theoryServiceMock.language.set('es');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Metrónomo');
  });

  it('should call metronome.toggle() on play button click', () => {
    const btn = fixture.nativeElement.querySelector('.play-btn');
    btn.click();
    expect(metronomeServiceMock.toggle).toHaveBeenCalled();
  });

  it('should call metronome.setBpm(val) on BPM input change', () => {
    const input = fixture.nativeElement.querySelector('input[type="number"]');
    input.value = '100';
    input.dispatchEvent(new Event('change'));
    expect(metronomeServiceMock.setBpm).toHaveBeenCalledWith(100);
  });

  it('should call adjustBpm(delta) -> metronome.setBpm() on - and + adjust buttons', () => {
    metronomeServiceMock.bpm.set(120);
    const btns = fixture.nativeElement.querySelectorAll('.bpm-input-wrap button');

    // - button
    btns[0].click();
    expect(metronomeServiceMock.setBpm).toHaveBeenCalledWith(119);

    // + button
    btns[1].click();
    expect(metronomeServiceMock.setBpm).toHaveBeenCalledWith(121);
  });

  it('should call metronome.setBpm(p) on preset buttons click', () => {
    const presetBtn = fixture.nativeElement.querySelectorAll('.preset-btn')[1]; // The 80 button
    presetBtn.click();
    expect(metronomeServiceMock.setBpm).toHaveBeenCalledWith(80);
  });

  it('should toggle accentEnabled signal on accent switch change', () => {
    const switchInput = fixture.nativeElement.querySelector('.switch input');

    expect(metronomeServiceMock.accentEnabled()).toBe(true);

    // Changing the checkbox fires change event
    switchInput.checked = false;
    switchInput.dispatchEvent(new Event('change'));

    expect(metronomeServiceMock.accentEnabled()).toBe(false);
  });

  it('should set beatsPerMeasure signal on beat selector button click', () => {
    const beatBtns = fixture.nativeElement.querySelectorAll('.beat-selector button');

    // click '3' button
    beatBtns[1].click();

    expect(metronomeServiceMock.beatsPerMeasure()).toBe(3);
  });
});
