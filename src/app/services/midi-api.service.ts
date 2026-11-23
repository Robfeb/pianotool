import { Injectable, signal, inject } from '@angular/core';
import { AudioService } from './audio.service';

export interface MidiNoteEvent {
  midiNumber: number;
  velocity: number;
  isOn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MidiApiService {
  private audio = inject(AudioService);
  readonly activeMidiNotes = signal<Map<number, number>>(new Map()); // midiNumber -> velocity
  private midiAccess: any | null = null;
  
  readonly isConnected = signal<boolean>(false);

  async requestAccess() {
    if (navigator.requestMIDIAccess) {
      try {
        this.midiAccess = await navigator.requestMIDIAccess();
        this.isConnected.set(true);
        
        // Listen to all inputs
        this.attachListeners();
        
        this.midiAccess.onstatechange = () => {
          this.attachListeners();
        };
      } catch (err) {
        console.error('MIDI Access denied or failed', err);
        this.isConnected.set(false);
      }
    } else {
      console.warn('Web MIDI API not supported in this browser.');
    }
  }

  private attachListeners() {
    if (!this.midiAccess) return;
    
    for (let input of this.midiAccess.inputs.values()) {
      input.onmidimessage = this.onMidiMessage.bind(this);
    }
  }

  private onMidiMessage(event: any) {
    const data = event.data;
    if (data.length < 3) return;

    const command = data[0] >> 4;
    const note = data[1];
    const velocity = data[2];

    if (command === 9 && velocity > 0) { // Note on
      this.updateNoteState(note, velocity, true);
    } else if (command === 8 || (command === 9 && velocity === 0)) { // Note off
      this.updateNoteState(note, 0, false);
    }
  }

  private updateNoteState(midiNumber: number, velocity: number, isOn: boolean) {
    const currentNotes = new Map(this.activeMidiNotes());
    if (isOn) {
      currentNotes.set(midiNumber, velocity);
      this.audio.playNote(midiNumber, velocity / 127);
    } else {
      currentNotes.delete(midiNumber);
      this.audio.releaseNote(midiNumber);
    }
    this.activeMidiNotes.set(currentNotes);
  }
}
