import { generateMockBinding } from 'src/test/test-utils';
import {
    getBindingIndex,
    validateEndpointConfig,
} from 'src/utils/workflow-utils';

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

describe('validateEndpointConfig', () => {
    const ENCRYPTED = { password_sops: 'ENC[...]', sops: {} };
    const PLAINTEXT = { password: 'hunter2' };

    const specDef = (endpoint: object) => ({ bindings: [], endpoint }) as any;
    const connectorSpecDef = (config: object) =>
        specDef({ connector: { image: 'source-x:dev', config } });

    test('accepts an encrypted connector config', () => {
        expect(validateEndpointConfig(connectorSpecDef(ENCRYPTED), false)).toBe(
            null
        );
    });

    test('accepts a Dekaf config', () => {
        expect(
            validateEndpointConfig(
                specDef({ dekaf: { variant: 'generic', config: ENCRYPTED } }),
                false
            )
        ).toBe(null);
    });

    test('rejects an endpoint that is not a connector or Dekaf', () => {
        expect(
            validateEndpointConfig(
                specDef({ local: { command: ['run'], config: {} } }),
                false
            )?.message
        ).toMatch(/connector or dekaf/);
    });

    test('rejects an unencrypted config when the task does not use secrets', () => {
        expect(
            validateEndpointConfig(connectorSpecDef(PLAINTEXT), false)?.message
        ).toMatch(/must be encrypted/);
    });

    // Its secret values live in secrets, not the config
    test('accepts an unencrypted config when the task uses secrets', () => {
        expect(validateEndpointConfig(connectorSpecDef(PLAINTEXT), true)).toBe(
            null
        );
    });
});
