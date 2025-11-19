import { describe, it, expect } from 'vitest';
import { minutesToTime, timeToMinutes } from '../time';

describe('time utils', () => {
  it('converts minutes to HH:MM correctly', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(60)).toBe('01:00');
    expect(minutesToTime(75)).toBe('01:15');
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('converts HH:MM to minutes correctly', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('01:00')).toBe(60);
    expect(timeToMinutes('01:15')).toBe(75);
    expect(timeToMinutes('23:59')).toBe(1439);
  });
});
