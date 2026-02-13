import { getArrayContext, isInsideArray } from 'src/forms/shared';

describe('shared', () => {
    describe('isInsideArray', () => {
        test('returns false for empty string', () => {
            expect(isInsideArray('')).toBe(false);
        });

        test('returns false for non-array path', () => {
            expect(isInsideArray('credentials')).toBe(false);
        });

        test('returns true for path with numeric segment', () => {
            expect(isInsideArray('stores.2.credentials')).toBe(true);
        });

        test('returns true for path starting with numeric segment', () => {
            expect(isInsideArray('0.credentials')).toBe(true);
        });

        test('returns false for null input', () => {
            expect(isInsideArray(null as any)).toBe(false);
        });

        test('returns false for undefined input', () => {
            expect(isInsideArray(undefined as any)).toBe(false);
        });
    });

    describe('getArrayContext', () => {
        test('returns null for empty string', () => {
            expect(getArrayContext('')).toBeNull();
        });

        test('returns null for path without array index', () => {
            expect(getArrayContext('credentials')).toBeNull();
        });

        test('returns null for null input', () => {
            expect(getArrayContext(null as any)).toBeNull();
        });

        test('returns null for undefined input', () => {
            expect(getArrayContext(undefined as any)).toBeNull();
        });

        test('extracts context from simple array path', () => {
            expect(getArrayContext('stores.2.credentials')).toStrictEqual({
                arrayField: 'stores',
                index: 2,
                rest: 'credentials',
            });
        });

        test('extracts context with index 0', () => {
            expect(getArrayContext('stores.0.credentials')).toStrictEqual({
                arrayField: 'stores',
                index: 0,
                rest: 'credentials',
            });
        });

        test('extracts context with nested rest path', () => {
            expect(
                getArrayContext('stores.1.credentials.oauth')
            ).toStrictEqual({
                arrayField: 'stores',
                index: 1,
                rest: 'credentials.oauth',
            });
        });

        test('extracts context with nested array field', () => {
            expect(
                getArrayContext('config.stores.3.credentials')
            ).toStrictEqual({
                arrayField: 'config.stores',
                index: 3,
                rest: 'credentials',
            });
        });

        test('finds first numeric segment in path with multiple indices', () => {
            expect(getArrayContext('stores.2.items.0.name')).toStrictEqual({
                arrayField: 'stores',
                index: 2,
                rest: 'items.0.name',
            });
        });
    });
});
