import { getSyncFrequency } from 'src/components/shared/Entity/Details/Overview/StatusStrip/shared';

describe('getSyncFrequency', () => {
    test('humanises a configured frequency', () => {
        expect(
            getSyncFrequency({
                endpoint: {
                    connector: {
                        config: { syncSchedule: { syncFrequency: '30m' } },
                    },
                },
            })
        ).toContain('30');
    });

    test('returns nothing when no sync schedule is set', () => {
        expect(
            getSyncFrequency({ endpoint: { connector: { config: {} } } })
        ).toBe(undefined);
    });

    test('returns nothing for a spec with no endpoint at all', () => {
        expect(getSyncFrequency(undefined)).toBe(undefined);
        expect(getSyncFrequency({})).toBe(undefined);
    });

    // Rather than rendering "Invalid Duration" into the strip.
    test('passes an unparseable value through unchanged', () => {
        expect(
            getSyncFrequency({
                endpoint: {
                    connector: {
                        config: { syncSchedule: { syncFrequency: 'nonsense' } },
                    },
                },
            })
        ).toBe('nonsense');
    });
});
