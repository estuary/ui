import { DateTime } from 'luxon';

import { DataGrains } from 'src/components/graphs/types';
import { LUXON_GRAIN_SETTINGS } from 'src/services/luxon';

// The chart formatter calls DateTime.fromISO(ts) without { setZone: true }, so Luxon
// converts the UTC timestamp to the local timezone by default.  Users in timezones
// behind UTC (e.g. EDT = UTC-4) will see April 1 00:00 UTC arrive as March 31 20:00
// local — a one-month shift.  The shortFormat / longFormat functions sometimes call
// .toUTC() before formatting so the label always reflects the UTC month.

describe('LUXON_GRAIN_SETTINGS', () => {
    describe('monthly grain', () => {
        const { shortFormat, longFormat, relativeUnit, timeUnit } =
            LUXON_GRAIN_SETTINGS[DataGrains.monthly];

        // Helper: April 1 00:00 UTC expressed in EDT (UTC-4) — the same instant a
        // user behind UTC would get from DateTime.fromISO('2026-04-01T00:00:00+00:00').
        const aprilUTCasEDT = DateTime.fromObject(
            { year: 2026, month: 3, day: 31, hour: 20 },
            { zone: 'America/New_York' }
        );

        describe('shortFormat', () => {
            test('returns the UTC month for a UTC DateTime', () => {
                expect(shortFormat(DateTime.utc(2026, 4, 1))).toBe('Apr');
            });

            test('returns UTC month when local time is in the previous month (regression)', () => {
                // aprilUTCasEDT is March 31 locally but April 1 in UTC.
                // Without .toUTC() this would return "Mar".
                expect(aprilUTCasEDT.toUTC().month).toBe(4); // sanity-check the fixture
                expect(shortFormat(aprilUTCasEDT)).toBe('Apr');
            });

            test('returns the UTC month for a UTC ISO string parsed by DateTime.fromISO', () => {
                // DateTime.fromISO without {setZone:true} uses local zone. This test
                // runs in whatever TZ the CI uses, but the UTC date is unambiguous.
                const val = DateTime.fromISO('2026-01-01T00:00:00+00:00');
                expect(shortFormat(val)).toBe('Jan');
            });

            test('formats each month correctly in UTC', () => {
                const months = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ];
                months.forEach((name, idx) => {
                    expect(shortFormat(DateTime.utc(2026, idx + 1, 1))).toBe(
                        name
                    );
                });
            });
        });

        describe('longFormat', () => {
            test('includes the UTC month name and year', () => {
                expect(longFormat(DateTime.utc(2026, 4, 1))).toContain('April');
                expect(longFormat(DateTime.utc(2026, 4, 1))).toContain('2026');
            });

            test('returns UTC month when local time is in the previous month (regression)', () => {
                // Same instant as the shortFormat regression test.
                expect(longFormat(aprilUTCasEDT)).toContain('April');
                expect(longFormat(aprilUTCasEDT)).toContain('2026');
            });
        });

        test('uses months as the relativeUnit and month as the timeUnit', () => {
            expect(relativeUnit).toBe('months');
            expect(timeUnit).toBe('month');
        });
    });

    describe('daily grain', () => {
        const { shortFormat, relativeUnit, timeUnit } =
            LUXON_GRAIN_SETTINGS[DataGrains.daily];

        test('formats as "MMM dd" in UTC', () => {
            expect(shortFormat(DateTime.utc(2026, 4, 15))).toBe('Apr 15');
        });

        test('uses days / day for relativeUnit / timeUnit', () => {
            expect(relativeUnit).toBe('days');
            expect(timeUnit).toBe('day');
        });
    });

    describe('hourly grain', () => {
        const { relativeUnit, timeUnit } =
            LUXON_GRAIN_SETTINGS[DataGrains.hourly];

        test('uses hours / hour for relativeUnit / timeUnit', () => {
            expect(relativeUnit).toBe('hours');
            expect(timeUnit).toBe('hour');
        });
    });
});
