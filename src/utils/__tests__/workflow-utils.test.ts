import { generateMockBinding } from 'src/test/test-utils';
import { getBindingIndex } from 'src/utils/workflow-utils';

describe('getBindingIndex', () => {
    let defaultResponse: number, matchedCollection: string;

    beforeEach(() => {
        defaultResponse = -1;
        matchedCollection = 'acme/found';
    });

    describe('returns -1 when', () => {
        test('bindings are empty', () => {
            expect(getBindingIndex([], '', -1)).toBe(defaultResponse);
            expect(getBindingIndex([null], '', -1)).toBe(defaultResponse);
            expect(getBindingIndex([undefined], '', -1)).toBe(defaultResponse);
            expect(getBindingIndex([{}], '', -1)).toBe(defaultResponse);
        });

        test('bindings do not contain collection', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('b', 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(-1);

            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('a', 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(-1);
        });

        test('multiple bindings map to the collection and the number of matched bindings is less than the target binding index', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    3
                )
            ).toBe(-1);
        });

        test('multiple bindings map to the collection and the number of matched bindings is equal to the target binding index', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    2
                )
            ).toBe(-1);
        });
    });

    describe('returns index when ', () => {
        test('collection name is found', () => {
            // Bindings that are listed as strings
            expect(
                getBindingIndex(
                    [matchedCollection, 'b', 'c'],
                    matchedCollection,
                    0
                )
            ).toBe(0);
            expect(
                getBindingIndex(
                    ['a', matchedCollection, 'c'],
                    matchedCollection,
                    0
                )
            ).toBe(1);
            expect(
                getBindingIndex(
                    ['a', 'b', matchedCollection],
                    matchedCollection,
                    0
                )
            ).toBe(2);
        });

        test('collection name is in a property of `target` or `source`', () => {
            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'capture'),
                        generateMockBinding(matchedCollection, 'capture'),
                        generateMockBinding('c', 'capture'),
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        generateMockBinding('a', 'materialization'),
                        generateMockBinding(
                            matchedCollection,
                            'materialization'
                        ),
                        generateMockBinding('c', 'materialization'),
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(1);
        });

        test('collection name is in a nested property of `name`', () => {
            expect(
                getBindingIndex(
                    [{ name: 'a' }, { name: matchedCollection }, { name: 'c' }],
                    matchedCollection,
                    0
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { source: { name: 'a' } },
                        { source: { name: matchedCollection } },
                        { source: { name: 'c' } },
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(1);

            expect(
                getBindingIndex(
                    [
                        { target: { name: 'a' } },
                        { target: { name: matchedCollection } },
                        { target: { name: 'c' } },
                    ],
                    matchedCollection,
                    0
                )
            ).toBe(1);
        });
    });
});
