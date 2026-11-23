import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardComponent } from './keyboard.component';
import { AudioService } from '../../services/audio.service';
import { MidiApiService } from '../../services/midi-api.service';
import { MidiPlayerService } from '../../services/midi-player.service';
import { TheoryService } from '../../services/theory.service';
import { signal } from '@angular/core';

describe('KeyboardComponent', () => {
  let component: KeyboardComponent;
  let fixture: ComponentFixture<KeyboardComponent>;

  // Mock Services
  let mockAudioService: any;
  let mockMidiApiService: any;
  let mockMidiPlayerService: any;
  let mockTheoryService: any;

  beforeEach(async () => {
    mockAudioService = {
      selectedPreset: signal('grand-piano'),
      switchPreset: vi.fn(),
      playNote: vi.fn(),
      releaseNote: vi.fn()
    };

    mockMidiApiService = {
      activeMidiNotes: signal(new Map())
    };

    mockMidiPlayerService = {
      currentlyPlayingNotes: signal(new Map()),
      targetNotes: signal([]),
      onUserNotePress: vi.fn()
    };

    mockTheoryService = {
      language: signal('en'),
      activeTheoryNotes: signal([]),
      getNoteName: vi.fn((midi: number) => 'C'),
      getNoteColor: vi.fn((midi: number) => '#fff')
    };

    await TestBed.configureTestingModule({
      imports: [KeyboardComponent],
      providers: [
        { provide: AudioService, useValue: mockAudioService },
        { provide: MidiApiService, useValue: mockMidiApiService },
        { provide: MidiPlayerService, useValue: mockMidiPlayerService },
        { provide: TheoryService, useValue: mockTheoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(KeyboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('State Initialization', () => {
  it('should initialize with default state values', () => {
    // Tests signal initial values
    expect(component.keyboardSize()).toBe(49);
    expect(component.scrollOffset()).toBe(0);
    expect(component.showNotes()).toBe(false);
    expect(component.colorizeNotes()).toBe(false);
    expect(component.pcOctave()).toBe(3);
    expect(component.localNotes().size).toBe(0);
  });

  it('should restore language and sound preferences on creation', () => {
    // verify the constructor called restorePrefs appropriately
    // The default in the mocked local storage is not set, so it falls back to defaults.
    // If we wanted to test local storage we would spy on it.
    // Since mockTheoryService.language is a signal we mock the set function.
    expect(mockAudioService.switchPreset).toHaveBeenCalledWith('grand-piano');
  });

  it('should compute keysConfig correctly based on keyboardSize', () => {
    component.keyboardSize.set(49);
    fixture.detectChanges();
    const config = component.keysConfig();
    expect(config.length).toBe(49);
    expect(config[0].midi).toBe(36); // startMidi for 49 is 36

    component.keyboardSize.set(88);
    fixture.detectChanges();
    const config88 = component.keysConfig();
    expect(config88.length).toBe(88); // 108 - 21 + 1 = 88
    expect(config88[0].midi).toBe(21);
  });




  });

  describe('Mouse Interactions', () => {
    it('should handle playNote correctly', () => {
      const testMidi = 60; // Middle C
      component.playNote(testMidi);

      expect(mockAudioService.playNote).toHaveBeenCalledWith(testMidi);
      expect(mockMidiPlayerService.onUserNotePress).toHaveBeenCalledWith(testMidi);
      expect(component.localNotes().has(testMidi)).toBe(true);
    });

    it('should handle releaseNote correctly', () => {
      const testMidi = 60; // Middle C
      // first add it
      component.playNote(testMidi);
      expect(component.localNotes().has(testMidi)).toBe(true);

      component.releaseNote(testMidi);

      expect(mockAudioService.releaseNote).toHaveBeenCalledWith(testMidi);
      expect(component.localNotes().has(testMidi)).toBe(false);
    });

    it('should ignore releaseNote if the note was not playing', () => {
      const testMidi = 60;
      // ensure clean state
      component.releaseAllLocalNotes();
      mockAudioService.releaseNote.mockClear();

      component.releaseNote(testMidi);
      expect(mockAudioService.releaseNote).not.toHaveBeenCalled();
    });

    it('should release all local notes', () => {
      component.playNote(60);
      component.playNote(64);
      component.playNote(67);

      expect(component.localNotes().size).toBe(3);
      component.releaseAllLocalNotes();

      expect(component.localNotes().size).toBe(0);
      expect(mockAudioService.releaseNote).toHaveBeenCalledWith(60);
      expect(mockAudioService.releaseNote).toHaveBeenCalledWith(64);
      expect(mockAudioService.releaseNote).toHaveBeenCalledWith(67);
    });
  });



  describe('PC Keyboard Interactions', () => {
    it('should ignore key repeats and input/select elements', () => {
      const eventRepeat = new KeyboardEvent('keydown', { key: 'a', repeat: true });
      Object.defineProperty(eventRepeat, 'target', { value: document.createElement('div') });
      component.onKeyDown(eventRepeat);
      expect(mockAudioService.playNote).not.toHaveBeenCalled();

      const inputEl = document.createElement('input');
      const eventInput = new KeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(eventInput, 'target', { value: inputEl });
      component.onKeyDown(eventInput);
      expect(mockAudioService.playNote).not.toHaveBeenCalled();
    });

    it('should map valid keys to midi notes and play', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(event, 'target', { value: document.createElement('div') });
      component.onKeyDown(event);

      const expectedMidi = component.pcKeyMap().get('a'); // default maps to 48 (C3)
      expect(expectedMidi).toBeDefined();
      expect(mockAudioService.playNote).toHaveBeenCalledWith(expectedMidi);
      expect(mockMidiPlayerService.onUserNotePress).toHaveBeenCalledWith(expectedMidi);
      expect(component.localNotes().has(expectedMidi!)).toBe(true);
    });

    it('should handle keyup for valid mapped keys', () => {
      const eventDown = new KeyboardEvent('keydown', { key: 'a' });
      Object.defineProperty(eventDown, 'target', { value: document.createElement('div') });
      const eventUp = new KeyboardEvent('keyup', { key: 'a' });

      component.onKeyDown(eventDown);
      const expectedMidi = component.pcKeyMap().get('a');
      expect(component.localNotes().has(expectedMidi!)).toBe(true);

      component.onKeyUp(eventUp);
      expect(mockAudioService.releaseNote).toHaveBeenCalledWith(expectedMidi);
      expect(component.localNotes().has(expectedMidi!)).toBe(false);
    });

    it('should not play note if key is invalid', () => {
      const event = new KeyboardEvent('keydown', { key: 'q' });
      Object.defineProperty(event, 'target', { value: document.createElement('div') });
      component.onKeyDown(event);
      expect(mockAudioService.playNote).not.toHaveBeenCalled();
    });
  });



  describe('Controls', () => {
    it('should shift octave up and down within bounds', () => {
      // initial octave is 3
      expect(component.pcOctave()).toBe(3);

      component.shiftOctave(1);
      expect(component.pcOctave()).toBe(4);

      component.shiftOctave(-2);
      expect(component.pcOctave()).toBe(2); // MIN_OCTAVE

      component.shiftOctave(-1);
      expect(component.pcOctave()).toBe(2); // Should not go below min

      component.shiftOctave(10);
      expect(component.pcOctave()).toBe(6); // MAX_OCTAVE
    });

    it('should shift sound preset cycling through presets', () => {
      // SOUND_PRESETS is imported in component
      // initial preset is mocked to 'grand-piano'
      const presets = component.soundPresets;
      expect(presets.length).toBeGreaterThan(0);

      component.shiftSound(1);
      // It should switch to the next preset id
      const nextId = presets[1].id;
      expect(mockAudioService.switchPreset).toHaveBeenCalledWith(nextId);

      // We can also test negative shift
      mockAudioService.selectedPreset.set(presets[0].id);
      component.shiftSound(-1);
      const lastId = presets[presets.length - 1].id;
      expect(mockAudioService.switchPreset).toHaveBeenCalledWith(lastId);
    });

    it('should handle UI change events like changeSize', () => {
      const selectEl = document.createElement('select');
      selectEl.value = '88';
      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: { value: '88' } });

      component.changeSize(event);
      expect(component.keyboardSize()).toBe(88);
      expect(component.scrollOffset()).toBe(0);
    });

    it('should get correct key fill visually', () => {
      const testKey = { midi: 60, isBlack: false, noteName: 'C', xOffset: 0 };
      const color = component.getKeyFill(testKey);
      expect(color).toBe('var(--key-white)'); // default inactive white key color

      // active
      component.playNote(60);
      const activeColor = component.getKeyFill(testKey);
      expect(activeColor).toBe('var(--accent-color)'); // default active color
    });
  });

});
