import { buildVirtualConfig } from 'src/forms/renderers/OAuth/buildVirtualConfig';

const MOCK_CONFIG = {
    start_date: '2025-01-01T00:00:00Z',
    stores: [
        {
            store: 'acme-widgets',
            credentials: {
                provider: 'oauth',
                client_id: 'abc',
                client_secret: 'xyz',
            },
        },
        {
            store: 'beta-shop',
            credentials: {
                provider: 'oauth',
                client_id: 'def',
                client_secret: 'uvw',
            },
        },
        {
            store: 'gamma-store',
            api_version: '2024-01',
            credentials: {
                provider: 'oauth',
            },
        },
    ],
};

describe('buildVirtualConfig', () => {
    let baseConfig: Record<string, any> = {};

    beforeEach(() => {
        baseConfig = {
            ...MOCK_CONFIG,
        };
    });

    describe('non-array paths return config as-is', () => {
        test('simple path', () => {
            const result = buildVirtualConfig(baseConfig, 'credentials');
            expect(result).toEqual(baseConfig);
        });

        test('empty path', () => {
            const result = buildVirtualConfig(baseConfig, '');
            expect(result).toEqual(baseConfig);
        });

        test('array typo path', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.1c.redentials'
            );
            expect(result).toEqual(baseConfig);
        });

        test('json pointer paths', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores/0/credentials'
            );
            expect(result).toEqual(baseConfig);
        });
    });

    describe('array paths (field promotion)', () => {
        test('promotes scalar fields from first store', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.0.credentials'
            );

            expect(result.store).toEqual('acme-widgets');
            expect(result.start_date).toEqual('2025-01-01T00:00:00Z');
            expect(result.stores).toEqual(baseConfig.stores);
        });

        test('promotes scalar fields from second store', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.1.credentials'
            );

            expect(result.store).toEqual('beta-shop');
        });

        test('promotes multiple scalar fields from store with api_version', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.2.credentials'
            );

            expect(result.store).toEqual('gamma-store');
            expect(result.api_version).toEqual('2024-01');
        });

        test('does not promote object fields (credentials)', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.0.credentials'
            );

            expect(result.credentials).toBeUndefined();
        });

        test('preserves original stores array in virtual config', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.0.credentials'
            );

            expect(result.stores).toStrictEqual(baseConfig.stores);
        });

        test('does not mutate original config', () => {
            const originalStores = [...baseConfig.stores];
            const originalStartDate = baseConfig.start_date;

            buildVirtualConfig(baseConfig, 'stores.0.credentials');

            expect(baseConfig.stores).toStrictEqual(originalStores);
            expect(baseConfig.start_date).toEqual(originalStartDate);
            expect(baseConfig.store).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        test('returns config as-is for out-of-bounds index', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.99.credentials'
            );
            expect(result).toEqual(baseConfig);
        });

        test('returns config as-is when array field does not exist', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'nonexistent.0.credentials'
            );
            expect(result).toEqual(baseConfig);
        });

        test('returns config as-is when array field is not an array', () => {
            const configWithNonArray = {
                stores: 'not-an-array',
                start_date: '2025-01-01T00:00:00Z',
            };

            const result = buildVirtualConfig(
                configWithNonArray,
                'stores.0.credentials'
            );

            expect(result).toEqual(configWithNonArray);
        });

        test('promotes null', () => {
            const result = buildVirtualConfig(
                {
                    stores: [
                        {
                            store: 'null_test',
                            nullable_field: null,
                        },
                    ],
                },
                'stores.0.credentials'
            );

            expect(result.store).toEqual('null_test');
            expect(result.nullable_field).toBeNull();
        });

        test('promotes undefined', () => {
            const result = buildVirtualConfig(
                {
                    stores: [
                        {
                            store: 'undefined_test',
                            undefined_field: undefined,
                        },
                    ],
                },
                'stores.0.credentials'
            );

            expect(result.store).toEqual('undefined_test');
            expect(result.undefined_field).toBeUndefined();
        });

        test('promotes booleans', () => {
            const result = buildVirtualConfig(
                {
                    stores: [
                        {
                            store: 'boolean_test',
                            enabled: true,
                            disabled: false,
                        },
                    ],
                },
                'stores.0.credentials'
            );

            expect(result.store).toEqual('boolean_test');
            expect(result.enabled).toEqual(true);
            expect(result.disabled).toEqual(false);
        });

        test('promotes numbers', () => {
            const result = buildVirtualConfig(
                {
                    stores: [
                        {
                            store: 'number_test',
                            floating: 123.456,
                            negative: -1,
                            positive: 42,
                            zero: 0,
                        },
                    ],
                },
                'stores.0.credentials'
            );

            expect(result.store).toEqual('number_test');
            expect(result.floating).toEqual(123.456);
            expect(result.negative).toEqual(-1);
            expect(result.positive).toEqual(42);
            expect(result.zero).toEqual(0);
        });
    });
});
