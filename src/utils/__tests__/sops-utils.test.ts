import type { Schema } from 'src/types';

import { copyEncryptedEndpointConfig } from 'src/utils/sops-utils';

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
                nested3: {
                    ...ROOT_MOCKS,
                },
            },
        },
    },
};

const BASE_MOCK = {
    ...ROOT_MOCKS,
    ...NESTED_MOCKS,
};

describe('copyEncryptedEndpointConfig', () => {
    let inputSpec: Schema = {};

    beforeEach(() => {
        inputSpec = {};
    });

    describe('when nothing is encrypted', () => {
        beforeEach(() => {
            inputSpec = { ...BASE_MOCK };
        });
        test('should return exact copy', () => {
            expect(
                copyEncryptedEndpointConfig(inputSpec, 'sops', false)
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
