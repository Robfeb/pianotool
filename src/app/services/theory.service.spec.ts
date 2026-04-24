import { TestBed } from '@angular/core/testing';
import { TheoryService } from './theory.service';

describe('TheoryService', () => {
  let service: TheoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    service = TestBed.inject(TheoryService);
    expect(service).toBeTruthy();
  });

  it('should return default value and not crash on invalid JSON in localStorage', () => {
    // Inject invalid JSON
    localStorage.setItem('piano_tool_language', '{ invalid json }');

    // Suppress console.error just for this test so we don't pollute test output
    const originalConsoleError = console.error;
    let errorLogged = false;
    console.error = () => { errorLogged = true; };

    // Service initialization should trigger loadPref('language', 'en')
    service = TestBed.inject(TheoryService);

    // Validate default value is loaded and the error was handled
    expect(service.language()).toBe('en');
    expect(errorLogged).toBe(true);

    // Restore original console error
    console.error = originalConsoleError;
  });
});
