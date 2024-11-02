import {deepMerge, formatBytes, getTextSizeInBytes, unwrap} from '..';

describe('formatBytes', () => {
  it('formats bytes correctly when the size is 0', () => {
    expect.assertions(1);
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes correctly', () => {
    expect.assertions(1);
    expect(formatBytes(1024)).toBe('1 kB');
  });
});

describe('getTextSizeInBytes', () => {
  it('calculates the size for a simple text', () => {
    expect.assertions(1);
    const text = 'text';
    expect(getTextSizeInBytes(text)).toBe(4);
  });

  it('calculates the size for an emoji text', () => {
    expect.assertions(1);
    const text = '🤔 🤓';
    expect(getTextSizeInBytes(text)).toBe(9);
  });
});

describe('unwrap', () => {
  it('returns an empty object', () => {
    expect.assertions(1);
    expect(unwrap(undefined)).toStrictEqual({});
  });

  it('returns a provided prop', () => {
    expect.assertions(1);
    const prop = 'prop';
    expect(unwrap(prop)).toStrictEqual(prop);
  });
});

describe('deepMerge', () => {
  it('should merge two flat objects', () => {
    const target = {a: 1, b: 2};
    const source = {b: 3, c: 4};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: 1, b: 2, c: 4}); // b should remain 2
  });

  it('should merge nested objects', () => {
    const target = {a: {b: 1}};
    const source = {a: {c: 2}};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: {b: 1, c: 2}}); // c should be added
  });

  it('should overwrite nested properties', () => {
    const target = {a: {b: 1, c: 2}};
    const source = {a: {b: 3}};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: {b: 1, c: 2}}); // b should remain 1
  });

  it('should handle arrays correctly', () => {
    const target = {a: [1, 2]};
    const source = {a: [3, 4]};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: [1, 2]});
  });

  it('should handle null values', () => {
    const target = {a: null};
    const source = {a: {b: 1}};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: {b: 1}}); // Replaces null with the object
  });

  it('should handle flat to nested', () => {
    const target = {a: 1, c: {d: 2, e: 3}};
    const source = {a: {b: 1}, c: 4};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: {b: 1}, c: 4});
  });

  it('should not modify the original objects', () => {
    const target = {a: 1};
    const source = {b: 2};
    deepMerge(target, source);
    expect(target).toEqual({a: 1, b: 2});
    expect(source).toEqual({b: 2}); // Source should remain unchanged
  });

  it('should handle empty objects', () => {
    const target = {};
    const source = {a: 1};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: 1}); // Merges from source
  });

  it('should handle deeply nested objects', () => {
    const target = {a: {b: {c: 1}}};
    const source = {a: {b: {d: 2}}};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: {b: {c: 1, d: 2}}});
  });

  it('should merge multiple levels of nesting', () => {
    const target = {a: {b: {c: {d: 1, e: 3}}}};
    const source = {a: {b: {c: {e: 2, f: 4}}}};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: {b: {c: {d: 1, e: 3, f: 4}}}});
  });
});
