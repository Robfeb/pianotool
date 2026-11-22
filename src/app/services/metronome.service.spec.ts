import { TestBed } from '@angular/core/testing';
import { MetronomeService } from './metronome.service';
import { AudioService } from './audio.service';
import { vi } from 'vitest';

vi.mock('tone', () => ({
  MembraneSynth: class {
    volume = { value: 0 };
    toDestination() { return this; }
    triggerAttackRelease() {}
  },
  Loop: class {
    start() {}
    stop() {}
  },
  getTransport: () => ({
    bpm: { value: 100 },
    start: vi.fn(),
    stop: vi.fn()
  }),
  getDraw: () => ({
    schedule: vi.fn()
  })
}));

describe('MetronomeService', () => {
  let service: MetronomeService;
  let audioServiceMock: any;

  beforeEach(() => {
    audioServiceMock = {
      ensureContext: vi.fn().mockResolvedValue(undefined)
    };
    TestBed.configureTestingModule({
      providers: [
        MetronomeService,
        { provide: AudioService, useValue: audioServiceMock }
      ]
    });
    service = TestBed.inject(MetronomeService);
  });

  it('should be created with default values', () => {
    expect(service).toBeTruthy();
    expect(service.bpm()).toBe(100);
    expect(service.isPlaying()).toBe(false);
  });

  it('should start and stop', () => {
    service.start();
    expect(service.isPlaying()).toBe(true);
    service.stop();
    expect(service.isPlaying()).toBe(false);
  });

  it('should toggle from stopped to playing', async () => {
    service.start = vi.fn(() => service.isPlaying.set(true));
    await service.toggle();
    expect(service.start).toHaveBeenCalled();
  });

  it('should toggle from playing to stopped', async () => {
    service.isPlaying.set(true);
    service.stop = vi.fn(() => service.isPlaying.set(false));
    await service.toggle();
    expect(service.stop).toHaveBeenCalled();
  });

  it('should clamp BPM values', () => {
    service.setBpm(20);
    expect(service.bpm()).toBe(40);
    service.setBpm(300);
    expect(service.bpm()).toBe(240);
  });
});
