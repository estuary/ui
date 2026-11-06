import { getIdTimestamp } from 'src/utils/flow-id-utils';

describe('getIdTimestamp', () => {
    test('returns the time a flow id was generated', () => {
        expect(getIdTimestamp('168ae3086d000378').toISOString()).toBe(
            '2026-11-02T17:00:30.298Z'
        );
    });

    test('accepts the colon-separated form', () => {
        expect(getIdTimestamp('16:8a:e3:08:6d:00:03:78')).toStrictEqual(
            getIdTimestamp('168ae3086d000378')
        );
    });

    test('counts from the Estuary epoch', () => {
        expect(getIdTimestamp('0000000000000000').getTime()).toBe(
            1_600_000_000_000
        );
    });

    test('ignores the sequence and shard bits', () => {
        expect(getIdTimestamp('00000000007fffff').getTime()).toBe(
            1_600_000_000_000
        );
        expect(getIdTimestamp('0000000000800000').getTime()).toBe(
            1_600_000_000_001
        );
        expect(getIdTimestamp('168ae3086d7fffff')).toStrictEqual(
            getIdTimestamp('168ae3086d000378')
        );
    });
});
