import {
    formatShuffle,
    parseTransforms,
} from 'src/components/shared/Entity/Details/DataFlow/transforms';

describe('parseTransforms', () => {
    test('returns null for a model without derive', () => {
        expect(parseTransforms({ key: ['/id'], schema: {} })).toBeNull();
        expect(parseTransforms(null)).toBeNull();
        expect(parseTransforms('not a model')).toBeNull();
    });

    test('returns an empty list when derive has no transforms array', () => {
        expect(parseTransforms({ derive: { using: { sqlite: {} } } })).toEqual(
            []
        );
    });

    test('parses a string source with defaults', () => {
        expect(
            parseTransforms({
                derive: { transforms: [{ name: 'a', source: 'acme/orders' }] },
            })
        ).toEqual([
            {
                name: 'a',
                source: 'acme/orders',
                shuffle: { type: 'default' },
                readDelay: null,
                priority: null,
                hasPartitionSelector: false,
                notBefore: null,
                notAfter: null,
                disabled: false,
            },
        ]);
    });

    test('parses an object source with partitions and time bounds', () => {
        const [transform] =
            parseTransforms({
                derive: {
                    transforms: [
                        {
                            name: 'bounded',
                            source: {
                                name: 'acme/orders',
                                partitions: {
                                    include: { region: ['us'] },
                                },
                                notBefore: '2026-01-01T00:00:00Z',
                                notAfter: '2026-06-01T00:00:00Z',
                            },
                            readDelay: '1h',
                            priority: 2,
                            disable: true,
                        },
                    ],
                },
            }) ?? [];

        expect(transform).toMatchObject({
            source: 'acme/orders',
            hasPartitionSelector: true,
            notBefore: '2026-01-01T00:00:00Z',
            notAfter: '2026-06-01T00:00:00Z',
            readDelay: '1h',
            priority: 2,
            disabled: true,
        });
    });

    test.each([
        ['any', { type: 'any' }],
        [{ key: ['/a', '/b'] }, { type: 'key', key: ['/a', '/b'] }],
        [{ lambda: 'SELECT $a;' }, { type: 'lambda' }],
        [{ lambda: { typescript: 'x' } }, { type: 'lambda' }],
        [undefined, { type: 'default' }],
        [{ unexpected: true }, { type: 'default' }],
    ])('parses shuffle %j', (shuffle, expected) => {
        const [transform] =
            parseTransforms({
                derive: { transforms: [{ name: 't', source: 's', shuffle }] },
            }) ?? [];

        expect(transform.shuffle).toEqual(expected);
    });

    test('skips transforms without a name or source', () => {
        expect(
            parseTransforms({
                derive: {
                    transforms: [
                        { source: 'acme/orders' },
                        { name: 'noSource' },
                        { name: 'badSource', source: { partitions: {} } },
                        'garbage',
                        { name: 'ok', source: 'acme/orders' },
                    ],
                },
            })?.map(({ name }) => name)
        ).toEqual(['ok']);
    });
});

describe('formatShuffle', () => {
    test('describes each shuffle form', () => {
        expect(formatShuffle({ type: 'any' })).toBe('any');
        expect(formatShuffle({ type: 'key', key: ['/a', '/b'] })).toBe(
            'key /a, /b'
        );
        expect(formatShuffle({ type: 'lambda' })).toBe('lambda');
        expect(formatShuffle({ type: 'default' })).toBe('source key');
    });
});
