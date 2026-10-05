import type { Schema } from 'src/types';

import {
    applyOverlay,
    copyEncryptedEndpointConfig,
} from 'src/utils/sops-utils';

describe('copyEncryptedEndpointConfig', () => {
    const sopsSuffix = '_sops';

    const ROOT_MOCKS = {
        stringVals: 'foo',
        numericalVals: 1,
        booleanVals: true,
    };

    const NESTED_MOCKS = {
        listVals: [1, 'two', { three: 3 }],
        nestedVals: {
            nested1: {
                nested2: {
                    ...ROOT_MOCKS,
                },
            },
        },
    };

    const BASE_MOCK = {
        ...ROOT_MOCKS,
        ...NESTED_MOCKS,
    };

    let inputSpec: Schema = {};

    beforeEach(() => {
        inputSpec = {};
    });

    describe('when nothing is encrypted', () => {
        test('should return exact copy', () => {
            inputSpec = { ...BASE_MOCK };

            expect(
                copyEncryptedEndpointConfig(inputSpec, sopsSuffix, false)
            ).toMatchSnapshot();
        });
    });

    describe('when values are encrypted - they should be removed', () => {
        test(`from encrypted keys in the root`, () => {
            inputSpec = {
                ...BASE_MOCK,
                foo_sops: 'whatever',
            };

            expect(
                copyEncryptedEndpointConfig(inputSpec, '_sops', false)
            ).toMatchSnapshot();
        });

        test(`from encrypted keys in objects`, () => {
            inputSpec = {
                ...BASE_MOCK,
                foo: {
                    nested1: {
                        nested2: {
                            nested_sops: 'value',
                        },
                    },
                },
            };

            expect(
                copyEncryptedEndpointConfig(inputSpec, '_sops', false)
            ).toMatchSnapshot();
        });

        test(`from encrypted keys in objects in arrays`, () => {
            inputSpec = {
                ...BASE_MOCK,
                foo: [
                    {
                        ...ROOT_MOCKS,
                        foo_sops: 'whatever',
                    },
                    {
                        ...ROOT_MOCKS,
                        foo_sops: 'whatever',
                    },
                    {
                        ...ROOT_MOCKS,
                        foo_sops: 'whatever',
                    },
                ],
            };
            expect(
                copyEncryptedEndpointConfig(inputSpec, '_sops', false)
            ).toMatchSnapshot();
        });

        // TODO (SOPS array) - we should probably add support for this to be safe
        //  This is something SOPS supports but we are probably safe for now (as of Q1 2026)
        test(`encrypted arrays are IGNORED`, () => {
            inputSpec = {
                ...BASE_MOCK,
                foo_sops: ['whatever', 'whatever', 'whatever'],
            };

            expect(
                copyEncryptedEndpointConfig(inputSpec, '_sops', false)
            ).toMatchSnapshot();
        });
    });
});

describe('applyOverlay', () => {
    test('merges an overlay leaf alongside an existing sibling', () => {
        expect(
            applyOverlay(
                { advanced: { slot_name: 'flow_slot' } },
                { advanced: { backfill_chunk_size: 50000 } }
            )
        ).toEqual({
            advanced: { slot_name: 'flow_slot', backfill_chunk_size: 50000 },
        });
    });

    test('overlay value supersedes an existing (stale) main-config value', () => {
        expect(
            applyOverlay(
                { advanced: { feature_flags: 'old_value' } },
                { advanced: { feature_flags: 'new_value' } }
            )
        ).toEqual({ advanced: { feature_flags: 'new_value' } });
    });

    test('populates an overlay field absent from the extracted data', () => {
        expect(
            applyOverlay({ address: 'db:5432' }, { advanced: { size: 1 } })
        ).toEqual({ address: 'db:5432', advanced: { size: 1 } });
    });

    test('a nested null clears a field (RFC 7396)', () => {
        expect(applyOverlay({ a: 1, b: 2 }, { b: null })).toEqual({ a: 1 });
    });

    test('a nested array replaces the existing value wholesale', () => {
        expect(applyOverlay({ a: [1, 2, 3] }, { a: [4] })).toEqual({
            a: [4],
        });
    });

    test('an empty overlay is a no-op', () => {
        expect(applyOverlay({ a: { b: 1 } }, {})).toEqual({ a: { b: 1 } });
    });

    test('a missing, null, or non-object overlay leaves the data unchanged', () => {
        const data = { advanced: { slot_name: 'flow_slot' } };

        expect(applyOverlay(data, undefined)).toEqual(data);
        expect(applyOverlay(data, null)).toEqual(data);
        expect(applyOverlay(data, 'not an object')).toEqual(data);
        expect(applyOverlay(data, [1, 2, 3])).toEqual(data);
    });

    test('does not mutate the extracted data', () => {
        const data = { advanced: { slot_name: 'flow_slot' } };
        applyOverlay(data, { advanced: { size: 1 } });

        expect(data).toEqual({ advanced: { slot_name: 'flow_slot' } });
    });
});
