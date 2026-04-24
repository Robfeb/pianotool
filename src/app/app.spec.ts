import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("tone", () => {
  return {
    PolySynth: class { toDestination() { return this; } volume = { value: 0 }; dispose() {} triggerAttack() {} triggerAttackRelease() {} triggerRelease() {} releaseAll() {} },
    MembraneSynth: class { toDestination() { return this; } volume = { value: 0 }; triggerAttackRelease() {} },
    PluckSynth: class { toDestination() { return this; } dispose() {} triggerAttack() {} },
    Synth: class {},
    FMSynth: class {},
    AMSynth: class {},
    Loop: class { start() {} stop() {} },
    Frequency: () => ({ toFrequency: () => 440, toNote: () => "A4" }),
    getContext: () => ({ state: "running" }),
    start: async () => {},
    now: () => 0,
    getTransport: () => ({ bpm: { value: 120 }, start: () => {}, stop: () => {} }),
    getDraw: () => ({ schedule: (cb: any) => cb() })
  };
});

import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
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
    expect(compiled.querySelector('h1')?.textContent).toContain('Piano Tool');
  });
});
