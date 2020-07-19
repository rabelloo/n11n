import { pluralize } from '../helpers/pluralize';

describe('pluralize', () => {
  it('should return empty string when invalid arg is passed', () => {
    expect(pluralize(null as any)).toBe('');
    expect(pluralize('')).toBe('');
  });

  it('should handle words that end in "ex"', () => {
    expect(pluralize('index')).toBe('indices');
  });

  it('should handle words that end in "us"', () => {
    expect(pluralize('cactus')).toBe('cacti');
  });

  it('should handle words that end in "f"', () => {
    expect(pluralize('wolf')).toBe('wolves');
    expect(pluralize('roof')).toBe('roofs');
  });

  it('should handle words that end in "fe"', () => {
    expect(pluralize('knife')).toBe('knives');
  });

  it('should handle words that end in "is"', () => {
    expect(pluralize('knife')).toBe('knives');
  });

  it('should handle words that end in "um"', () => {
    expect(pluralize('datum')).toBe('data');
  });

  it('should handle words that end in "o"', () => {
    expect(pluralize('potato')).toBe('potatoes');
    expect(pluralize('video')).toBe('videos');
  });

  it('should handle words that end in "y"', () => {
    expect(pluralize('country')).toBe('countries');
    expect(pluralize('subway')).toBe('subways');
  });

  it('should handle words that end in "craft"', () => {
    expect(pluralize('aircraft')).toBe('aircraft');
  });

  it('should handle words that end in "ch", "sh", "s", "x" (but not "ex") or "z"', () => {
    expect(pluralize('bench')).toBe('benches');
    expect(pluralize('marsh')).toBe('marshes');
    expect(pluralize('kiss')).toBe('kisses');
    expect(pluralize('cosmos')).toBe('cosmoses');
    expect(pluralize('tax')).toBe('taxes');
    expect(pluralize('topaz')).toBe('topazes');
  });
});
