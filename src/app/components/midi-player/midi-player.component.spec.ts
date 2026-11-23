import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MidiPlayerComponent } from './midi-player.component';
import { MidiPlayerService } from '../../services/midi-player.service';
import { TheoryService } from '../../services/theory.service';
import { signal } from '@angular/core';
describe('MidiPlayerComponent', () => {
  let component: MidiPlayerComponent;
  let fixture: ComponentFixture<MidiPlayerComponent>;
  let midiPlayerMock: any;
  let theoryMock: any;

  beforeEach(async () => {
    midiPlayerMock = {
      currentFileName: signal(null),
      currentMidi: signal(null),
      isPlaying: signal(false),
      playbackRate: signal(1.0),
      isPracticeMode: signal(false),
      practiceSteps: signal([]),
      currentStepIndex: signal(0),
      playLH: signal(true),
      playRH: signal(true),
      loadFile: vi.fn(),
      setPlaybackRate: vi.fn(),
      generatePracticeSteps: vi.fn(),
      schedulePlayback: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      loadMidiFromUrl: vi.fn(),
    };

    theoryMock = {
      language: signal('en'),
    };

    await TestBed.configureTestingModule({
      imports: [MidiPlayerComponent],
      providers: [
        { provide: MidiPlayerService, useValue: midiPlayerMock },
        { provide: TheoryService, useValue: theoryMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MidiPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load file when selected', () => {
    const file = new File([''], 'test.mid');
    const event = { target: { files: [file] } };
    component.onFileSelected(event);
    expect(midiPlayerMock.loadFile).toHaveBeenCalledWith(file);
  });

  it('should set practice mode correctly', () => {
    component.setMode(true);
    expect(midiPlayerMock.stop).toHaveBeenCalled();
    expect(midiPlayerMock.isPracticeMode()).toBe(true);
    expect(midiPlayerMock.generatePracticeSteps).toHaveBeenCalled();

    component.setMode(false);
    expect(midiPlayerMock.isPracticeMode()).toBe(false);
  });

  it('should toggle play state', () => {
    midiPlayerMock.currentMidi.set({}); // Mock some midi
    component.togglePlay();
    expect(midiPlayerMock.schedulePlayback).toHaveBeenCalled();
    expect(midiPlayerMock.play).toHaveBeenCalled();

    midiPlayerMock.isPlaying.set(true);
    component.togglePlay();
    expect(midiPlayerMock.pause).toHaveBeenCalled();
  });

  it('should stop playback', () => {
    component.stop();
    expect(midiPlayerMock.stop).toHaveBeenCalled();
  });

  it('should toggle left hand', () => {
    component.toggleLH();
    expect(midiPlayerMock.playLH()).toBe(false);
    expect(midiPlayerMock.generatePracticeSteps).not.toHaveBeenCalled(); // Because isPracticeMode is false

    midiPlayerMock.isPracticeMode.set(true);
    component.toggleLH();
    expect(midiPlayerMock.playLH()).toBe(true);
    expect(midiPlayerMock.generatePracticeSteps).toHaveBeenCalled();
  });

  it('should toggle right hand', () => {
    component.toggleRH();
    expect(midiPlayerMock.playRH()).toBe(false);
  });

  it('should reset practice step index', () => {
    midiPlayerMock.currentStepIndex.set(5);
    component.resetPractice();
    expect(midiPlayerMock.currentStepIndex()).toBe(0);
  });

  it('should change speed correctly', () => {
    const event = { target: { value: '1.5' } } as unknown as Event;
    component.onSpeedChange(event);
    expect(midiPlayerMock.setPlaybackRate).toHaveBeenCalledWith(1.5);
  });

  it('should load song on selection', () => {
    const event = { target: { value: component.songs[0].path } } as unknown as Event;
    component.onSongSelected(event);
    expect(midiPlayerMock.loadMidiFromUrl).toHaveBeenCalledWith(component.songs[0].path, component.songs[0].name);
  });

  it('should load exercise on selection', () => {
    // Assuming exercises are available
    if (component.exerciseKeys.length > 0) {
      const cat = component.exerciseKeys[0];
      const subKeys = component.getSubKeys(cat);
      if (subKeys.length > 0) {
        const sub = subKeys[0];
        const exercises = component.getExercises(cat, sub);
        if (exercises.length > 0) {
          const ex = exercises[0];
          const event = { target: { value: ex.path } } as unknown as Event;
          component.onExerciseSelected(event);
          expect(midiPlayerMock.loadMidiFromUrl).toHaveBeenCalledWith(ex.path, `${cat} - ${sub} - ${ex.name}`);
        }
      }
    }
  });
});
