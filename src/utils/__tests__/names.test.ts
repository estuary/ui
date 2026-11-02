import { describe, expect, test } from 'vitest';

import { getParentPrefix, isValidName } from 'src/utils/names';

describe('isValidName', () => {
    test.each(['acmeCo/key', 'acmeCo/team/api-key', 'acmeCo/a.b_c-d'])(
        'should accept %s',
        (name) => {
            expect(isValidName(name)).toBe(true);
        }
    );

    test.each([
        ['null', null],
        ['undefined', undefined],
        ['an empty string', ''],
        ['a name without a prefix', 'key'],
        ['a bare prefix', 'acmeCo/'],
        ['an empty segment', 'acmeCo//key'],
        ['a space', 'acmeCo/k ey'],
        ['a leading slash', '/acmeCo/key'],
    ])('should reject %s', (_label, name) => {
        expect(isValidName(name)).toBe(false);
    });
});

describe('getParentPrefix', () => {
    test('should return the prefix a name sits under', () => {
        expect(getParentPrefix('acmeCo/team/api-key')).toBe('acmeCo/team/');
    });

    test('should return the tenant for a top-level name', () => {
        expect(getParentPrefix('acmeCo/api-key')).toBe('acmeCo/');
    });

    test('should return an empty string for a name with no prefix', () => {
        expect(getParentPrefix('api-key')).toBe('');
    });
});
