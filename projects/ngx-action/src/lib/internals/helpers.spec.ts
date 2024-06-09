import { assertIsDefined } from './helpers';

describe('assertIsDefined', () => {
  it('should throw if value is null or undefined', () => {
    expect(() => assertIsDefined(null)).toThrow();
    expect(() => assertIsDefined(undefined)).toThrow();
  });
});
