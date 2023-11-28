import { getBindingIndex } from 'utils/workflow-utils';
import { describe, expect, test } from 'vitest';

const defaultResponse = -1;
const foundName = 'acme/found';

describe('getBindingIndex', () => {
    test('handles different empty states for bindings', () => {
        expect(getBindingIndex(undefined, '')).toBe(defaultResponse);
        expect(getBindingIndex(null, '')).toBe(defaultResponse);

        expect(getBindingIndex([], '')).toBe(defaultResponse);
        expect(getBindingIndex([null], '')).toBe(defaultResponse);
        expect(getBindingIndex([{}], '')).toBe(defaultResponse);
    });

    test('returns -1 when collection name is not found', () => {
        expect(getBindingIndex(['a', 'b', 'c'], foundName)).toBe(-1);
    });

    describe('returns index when ', () => {
        test('collection name is found', () => {
            // Bindings that are listed as strings
            expect(getBindingIndex([foundName, 'b', 'c'], foundName)).toBe(0);
            expect(getBindingIndex(['a', foundName, 'c'], foundName)).toBe(1);
            expect(getBindingIndex(['a', 'b', foundName], foundName)).toBe(2);
        });

        test('collection name is in a property of `target` or `source`', () => {
            expect(
                getBindingIndex(
                    [{ source: 'a' }, { source: foundName }, { source: 'c' }],
                    foundName
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [{ target: 'a' }, { target: foundName }, { target: 'c' }],
                    foundName
                )
            ).toBe(1);
        });

        test('collection name is in a nested property of `name`', () => {
            expect(
                getBindingIndex(
                    [{ name: 'a' }, { name: foundName }, { name: 'c' }],
                    foundName
                )
            ).toBe(1);
            expect(
                getBindingIndex(
                    [
                        { source: { name: 'a' } },
                        { source: { name: foundName } },
                        { source: { name: 'c' } },
                    ],
                    foundName
                )
            ).toBe(1);
            expect(
                getBindingIndex(
                    [
                        { target: { name: 'a' } },
                        { target: { name: foundName } },
                        { target: { name: 'c' } },
                    ],
                    foundName
                )
            ).toBe(1);
        });
    });
});
