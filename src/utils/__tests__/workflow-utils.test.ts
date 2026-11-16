import type { ResourceConfig } from 'src/stores/Binding/types';
import type { Schema } from 'src/types';
import type { BuiltCollection, BuiltSpec } from 'src/types/schemaModels';

import { generateMockBinding } from 'src/test/test-utils';
import {
    getBindingCorrespondence,
    getBindingIndex,
    getBindingIndexByResourcePath,
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

describe('binding correspondence', () => {
    const binding = (table: string, path = table): Schema => ({
        source: builtCollection.name,
        resource: { table, _meta: { path: [path] } },
    });
    const built = (tables: string[], indirect = false): Schema => ({
        ...(indirect ? { linkedCollections: [builtCollection] } : {}),
        bindings: tables.map((table) => ({
            ...(indirect ? {} : { collection: builtCollection }),
            resourceConfig: { table },
            resourcePath: [table],
        })),
    });
    const config = (bindings: Schema[], bindingIndex = 0): ResourceConfig => ({
        data: bindings[bindingIndex].resource,
        errors: [],
        meta: {
            draftedResource: structuredClone(bindings[bindingIndex].resource),
            bindingIndex,
            collectionName: builtCollection.name,
            disable: bindings[bindingIndex].disable,
            builtBindingIndex: -1,
            validatedBindingIndex: -1,
            liveBuiltBindingIndex: -1,
            liveBindingIndex: -1,
        },
    });
    const absent = {
        builtBindingIndex: -1,
        validatedBindingIndex: -1,
        liveBuiltBindingIndex: -1,
        liveBindingIndex: -1,
    };

    test.each([
        [false, false],
        [false, true],
        [true, false],
        [true, true],
    ])(
        'joins independently reordered arrays (draft indirect: %s, live indirect: %s)',
        (draftIndirect, liveIndirect) => {
            const draft = {
                spec: { bindings: [binding('b'), binding('a')] },
                built_spec: built(['a', 'b'], draftIndirect),
                validated: {
                    bindings: [
                        { resourcePath: ['b'] },
                        { resourcePath: ['a'] },
                    ],
                },
            };
            const live = {
                spec: { bindings: [binding('a'), binding('b')] },
                built_spec: built(['b', 'a'], liveIndirect),
            };
            const before = JSON.stringify([draft, live]);
            expect(
                getBindingCorrespondence(
                    config(draft.spec.bindings),
                    draft,
                    live
                )
            ).toEqual({
                builtBindingIndex: 1,
                validatedBindingIndex: 0,
                liveBuiltBindingIndex: 0,
                liveBindingIndex: 1,
            });
            expect(
                getBindingCorrespondence(
                    config(draft.spec.bindings, 1),
                    draft,
                    live
                )
            ).toEqual({
                builtBindingIndex: 0,
                validatedBindingIndex: 1,
                liveBuiltBindingIndex: 1,
                liveBindingIndex: 0,
            });
            expect(JSON.stringify([draft, live])).toBe(before);
        }
    );

    test('uses current output paths after a table swap despite stale authored metadata', () => {
        const draft = {
            spec: { bindings: [binding('b', 'a'), binding('a', 'b')] },
            built_spec: built(['a', 'b']),
            validated: {
                bindings: [{ resourcePath: ['a'] }, { resourcePath: ['b'] }],
            },
        };
        const live = {
            spec: { bindings: [binding('a'), binding('b')] },
            built_spec: built(['a', 'b']),
        };
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft, live)
        ).toEqual({
            builtBindingIndex: 1,
            validatedBindingIndex: 1,
            liveBuiltBindingIndex: 1,
            liveBindingIndex: 1,
        });
    });

    test('preserves live identity after nonidentity configuration changes and supports new bindings without metadata', () => {
        const draft = {
            spec: {
                bindings: [
                    { ...binding('a'), resource: { table: 'a', delta: true } },
                ],
            },
            built_spec: {
                bindings: [
                    {
                        collection: builtCollection,
                        resourceConfig: { delta: true, table: 'a' },
                        resourcePath: ['a'],
                    },
                ],
            },
            validated: { bindings: [{ resourcePath: ['a'] }] },
        };
        const live = {
            spec: { bindings: [binding('a')] },
            built_spec: built(['a']),
        };
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft, live)
        ).toEqual({
            builtBindingIndex: 0,
            validatedBindingIndex: 0,
            liveBuiltBindingIndex: 0,
            liveBindingIndex: 0,
        });
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft)
        ).toEqual({
            ...absent,
            builtBindingIndex: 0,
            validatedBindingIndex: 0,
        });
    });

    test.each(['explicit', 'before validation', 'after validation'])(
        'does not shift the next binding when a preceding binding is disabled %s',
        (when) => {
            const draft = {
                spec: {
                    bindings: [
                        { ...binding('a'), disable: when === 'explicit' },
                        binding('b'),
                    ],
                },
                built_spec: built(['b']),
                validated: {
                    bindings:
                        when === 'after validation'
                            ? [{ resourcePath: ['a'] }, { resourcePath: ['b'] }]
                            : [{ resourcePath: ['b'] }],
                },
            };
            expect(
                getBindingCorrespondence(config(draft.spec.bindings, 1), draft)
            ).toEqual({
                ...absent,
                builtBindingIndex: 0,
                validatedBindingIndex: when === 'after validation' ? 1 : 0,
            });
            expect(
                getBindingCorrespondence(config(draft.spec.bindings), draft)
            ).toEqual(absent);
        }
    );

    test('rejects ambiguous authored or built configurations instead of choosing the first', () => {
        const draft = {
            spec: { bindings: [binding('a'), binding('a', 'old')] },
            built_spec: built(['a']),
            validated: { bindings: [{ resourcePath: ['a'] }] },
        };
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft)
        ).toEqual(absent);
        draft.spec.bindings[1].disable = true;
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft)
                .builtBindingIndex
        ).toBe(0);
        draft.built_spec = built(['a', 'a']);
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft)
        ).toEqual(absent);
    });

    test('a newly added binding cannot use a provisional index to claim an existing identical resource', () => {
        const draft = {
            spec: { bindings: [binding('a')] },
            built_spec: built(['a']),
            validated: { bindings: [{ resourcePath: ['a'] }] },
        };
        const target = config(draft.spec.bindings);
        target.meta.added = true;
        expect(getBindingCorrespondence(target, draft)).toEqual(absent);
        target.meta.added = false;
        expect(getBindingCorrespondence(target, draft).builtBindingIndex).toBe(
            0
        );
    });

    test('rejects mismatched resources, collections, invalid references and absent results', () => {
        const draft = {
            spec: { bindings: [binding('a'), binding('b')] },
            built_spec: built(['a', 'b'], true),
            validated: {
                bindings: [{ resourcePath: ['a'] }, { resourcePath: ['b'] }],
            },
        };
        const target = config(draft.spec.bindings);
        expect(
            getBindingCorrespondence(
                {
                    ...target,
                    meta: { ...target.meta, draftedResource: { table: 'b' } },
                },
                draft
            )
        ).toEqual(absent);
        expect(
            getBindingCorrespondence(
                {
                    ...target,
                    meta: {
                        ...target.meta,
                        collectionName: 'different/collection',
                    },
                },
                draft
            )
        ).toEqual(absent);
        expect(getBindingCorrespondence(target, undefined)).toEqual(absent);
        draft.built_spec.bindings[0].collectionIndex = 99;
        expect(getBindingCorrespondence(target, draft)).toEqual(absent);
        expect(
            getBindingCorrespondence(target, { ...draft, built_spec: null })
        ).toEqual(absent);
    });

    test('excludes only top-level resource metadata', () => {
        const draft = {
            spec: {
                bindings: [
                    {
                        source: builtCollection.name,
                        resource: {
                            table: 'a',
                            nested: { _meta: 1 },
                            _meta: { path: ['old'] },
                        },
                    },
                ],
            },
            built_spec: {
                bindings: [
                    {
                        collection: builtCollection,
                        resourceConfig: { table: 'a', nested: { _meta: 1 } },
                        resourcePath: ['a'],
                    },
                ],
            },
            validated: { bindings: [{ resourcePath: ['a'] }] },
        };
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft)
                .builtBindingIndex
        ).toBe(0);
        draft.built_spec.bindings[0].resourceConfig.nested._meta = 2;
        expect(
            getBindingCorrespondence(config(draft.spec.bindings), draft)
        ).toEqual(absent);
    });

    test('matches paths as exact arrays and rejects duplicate paths', () => {
        const schema = {
            bindings: [
                { resourcePath: ['a.b', 'c'] },
                { resourcePath: ['a', 'b.c'] },
            ],
        };
        expect(getBindingIndexByResourcePath(['a', 'b.c'], schema)).toBe(1);
        expect(getBindingIndexByResourcePath(['a.b.c'], schema)).toBe(-1);
        schema.bindings.push(schema.bindings[0]);
        expect(getBindingIndexByResourcePath(['a.b', 'c'], schema)).toBe(-1);
        expect(getBindingIndexByResourcePath([], schema)).toBe(-1);
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
