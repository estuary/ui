import { expect, test } from 'vitest';
import { checkForErrors } from '../utils';

test('checkForErrors will handle different states for errors', () => {
    expect(checkForErrors({})).toBe(undefined);
    expect(checkForErrors({ errors: null })).toBe(null);

    expect(checkForErrors({ errors: [] })).toBe(false);
    expect(checkForErrors({ errors: [1] })).toBe(true);

    expect(checkForErrors({ errors: 'fake error' })).toBe(true);
});
