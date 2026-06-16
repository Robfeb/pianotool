import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AudioService } from './services/audio.service';
import { MetronomeService } from './services/metronome.service';
import { signal } from '@angular/core';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: AudioService,
          useValue: {
            ensureContext: async () => {},
            triggerAttackRelease: () => {},
            playNote: () => {},
            releaseNote: () => {},
            releaseAll: () => {},
            switchPreset: () => {},
            selectedPreset: signal('grand-piano')
          }
        },
        {
          provide: MetronomeService,
          useValue: {
             toggle: () => {},
             setTempo: () => {},
             setBeatVolume: () => {},
             setSubdivision: () => {},
             toggleTickMode: () => {},
             isPlaying: signal(false),
             tempo: signal(120),
             beatVolume: signal(0),
             subdivision: signal('1/4'),
             isTickMode: signal(false)
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain("Rob's Piano Tool");
  });
});
