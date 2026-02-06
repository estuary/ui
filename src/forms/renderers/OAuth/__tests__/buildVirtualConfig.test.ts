import { buildVirtualConfig } from 'src/forms/renderers/OAuth/buildVirtualConfig';

describe('buildVirtualConfig', () => {
    const baseConfig = {
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
        start_date: '2025-01-01T00:00:00Z',
    };

    describe('non-array paths (passthrough)', () => {
        test('returns config as-is for simple path', () => {
            const result = buildVirtualConfig(baseConfig, 'credentials');
            expect(result).toBe(baseConfig);
        });

        test('returns config as-is for empty path', () => {
            const result = buildVirtualConfig(baseConfig, '');
            expect(result).toBe(baseConfig);
        });
    });

    describe('array paths (field promotion)', () => {
        test('promotes scalar fields from first store', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.0.credentials'
            );

            expect(result.store).toBe('acme-widgets');
            expect(result.start_date).toBe('2025-01-01T00:00:00Z');
            expect(result.stores).toBe(baseConfig.stores);
        });

        test('promotes scalar fields from second store', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.1.credentials'
            );

            expect(result.store).toBe('beta-shop');
        });

        test('promotes multiple scalar fields from store with api_version', () => {
            const result = buildVirtualConfig(
                baseConfig,
                'stores.2.credentials'
            );

            expect(result.store).toBe('gamma-store');
            expect(result.api_version).toBe('2024-01');
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
            expect(baseConfig.start_date).toBe(originalStartDate);
            expect((baseConfig as any).store).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        test('returns config as-is for out-of-bounds index', () => {
            const result = buildVirtualConfig(baseConfig, 'stores.99.credentials');
            expect(result).toBe(baseConfig);
        });

        test('returns config as-is when array field does not exist', () => {
            const result = buildVirtualConfig(baseConfig, 'nonexistent.0.credentials');
            expect(result).toBe(baseConfig);
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
            expect(result).toBe(configWithNonArray);
        });

        test('promotes null values as scalars', () => {
            const configWithNull = {
                stores: [{ store: 'test', nullable_field: null }],
            };
            const result = buildVirtualConfig(
                configWithNull,
                'stores.0.credentials'
            );
            expect(result.store).toBe('test');
            expect(result.nullable_field).toBeNull();
        });

        test('promotes boolean and number values', () => {
            const configWithPrimitives = {
                stores: [
                    {
                        store: 'test',
                        enabled: true,
                        priority: 42,
                    },
                ],
            };
            const result = buildVirtualConfig(
                configWithPrimitives,
                'stores.0.credentials'
            );
            expect(result.store).toBe('test');
            expect(result.enabled).toBe(true);
            expect(result.priority).toBe(42);
        });
    });
});
