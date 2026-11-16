import type { BuiltCollection, BuiltSpec } from 'src/types/schemaModels';

import { generateMockBinding } from 'src/test/test-utils';
import {
    getBindingIndex,
    getBuiltBindingIndex,
    getBuiltCollection,
} from 'src/utils/workflow-utils';

const builtCollection: BuiltCollection = {
    ackTemplate: {},
    key: ['/id'],
    name: 'acme/collection',
    partitionTemplate: {},
    projections: [{ field: 'id', ptr: '/id', inference: { type: 'string' } }],
    uuidPtr: '/_meta/uuid',
    writeSchema: {},
};

const sameNameCollection: BuiltCollection = {
    ...builtCollection,
    key: ['/other_id'],
    projections: [
        { field: 'other_id', ptr: '/other_id', inference: { type: 'integer' } },
    ],
};

describe('getBuiltCollection', () => {
    test.each([{}, { linkedCollections: [] }])(
        'reads the inline collection when the table is absent or empty: %j',
        (spec) => {
            expect(
                getBuiltCollection(spec, {
                    collection: builtCollection,
                    collectionIndex: 99,
                })
            ).toBe(builtCollection);
        }
    );

    test.each([undefined, 0, 1])(
        'reads index %s from the table, including omitted zero',
        (collectionIndex) => {
            const spec = {
                linkedCollections: [builtCollection, sameNameCollection],
            };

            expect(
                getBuiltCollection(spec, {
                    collection: sameNameCollection,
                    collectionIndex,
                })
            ).toBe(spec.linkedCollections[collectionIndex ?? 0]);
        }
    );

    test('resolves against the enclosing spec', () => {
        const binding = { collectionIndex: 0 };

        expect(
            getBuiltCollection(
                { linkedCollections: [builtCollection] },
                binding
            )
        ).toBe(builtCollection);
        expect(
            getBuiltCollection(
                { linkedCollections: [sameNameCollection] },
                binding
            )
        ).toBe(sameNameCollection);
    });

    test.each([-1, 0.5, NaN, Infinity, 2])(
        'returns unavailable for invalid index %s without using the inline value',
        (collectionIndex) => {
            expect(
                getBuiltCollection(
                    {
                        linkedCollections: [
                            builtCollection,
                            sameNameCollection,
                        ],
                    },
                    { collection: builtCollection, collectionIndex }
                )
            ).toBeUndefined();
        }
    );

    test('returns unavailable for missing inputs or inline collection', () => {
        expect(
            getBuiltCollection(undefined, { collection: builtCollection })
        ).toBeUndefined();
        expect(getBuiltCollection({}, undefined)).toBeUndefined();
        expect(
            getBuiltCollection({ linkedCollections: [builtCollection] }, null)
        ).toBeUndefined();
        expect(getBuiltCollection({}, {})).toBeUndefined();
    });

    test('preserves repeated references and different same-name collections without modifying either representation', () => {
        const inline: BuiltSpec = {
            bindings: [
                { collection: sameNameCollection },
                { collection: builtCollection },
                { collection: sameNameCollection },
            ],
        };
        const indirect: BuiltSpec = {
            bindings: [{ collectionIndex: 1 }, {}, { collectionIndex: 1 }],
            linkedCollections: [builtCollection, sameNameCollection],
        };
        const before = JSON.stringify([inline, indirect]);
        const inlineCollections = inline.bindings!.map((binding) =>
            getBuiltCollection(inline, binding)
        );
        const indirectCollections = indirect.bindings!.map((binding) =>
            getBuiltCollection(indirect, binding)
        );

        expect(indirectCollections).toEqual(inlineCollections);
        expect(indirectCollections[0]).toBe(sameNameCollection);
        expect(indirectCollections[1]).toBe(builtCollection);
        expect(indirectCollections[2]).toBe(indirectCollections[0]);
        expect(JSON.stringify([inline, indirect])).toBe(before);
    });
});

describe('getBuiltBindingIndex', () => {
    test('reads inline and indirect names, skipping unavailable references', () => {
        expect(
            getBuiltBindingIndex(
                { bindings: [{}, { collection: builtCollection }] },
                builtCollection.name
            )
        ).toBe(1);
        expect(
            getBuiltBindingIndex(
                {
                    bindings: [{ collectionIndex: 99 }, {}],
                    linkedCollections: [builtCollection],
                },
                builtCollection.name
            )
        ).toBe(1);
        expect(getBuiltBindingIndex({}, builtCollection.name)).toBe(-1);
    });
});

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
