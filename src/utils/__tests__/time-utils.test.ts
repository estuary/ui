import {
    formatCaptureInterval,
    parsePostgresInterval,
} from 'src/utils/time-utils';

describe('formatCaptureInterval', () => {
    describe('returns null', () => {
        test('when the interval is null', () => {
            expect(formatCaptureInterval(null)).toBeNull();
        });

        test('when the interval is undefined', () => {
            expect(formatCaptureInterval(undefined)).toBeNull();
        });
    });

    test('returns an empty string when the interval is an empty string', () => {
        expect(formatCaptureInterval('')).toBe('');
    });

    test('returns the original interval when the interval is not in a supported format', () => {
        expect(formatCaptureInterval('  ')).toBe('  ');

        expect(formatCaptureInterval('2')).toBe('2');

        expect(formatCaptureInterval('20:00')).toBe('20:00');

        expect(formatCaptureInterval('01:20:00')).toBe('01:20:00');

        expect(formatCaptureInterval('1h2m')).toBe('1h2m');
    });

    test('returns a formatted capture interval when the interval is in a supported format', () => {
        expect(formatCaptureInterval('1h 20m')).toBe('1h 20m');

        expect(formatCaptureInterval('1h 20m 5s')).toBe('1h 20m 5s');

        expect(formatCaptureInterval('20m')).toBe('20m');

        expect(
            formatCaptureInterval(
                '100000000000000000h 200000000000000000000000000000000m 5000000000000000000000000000000s'
            )
        ).toBe(
            '100000000000000000h 200000000000000000000000000000000m 5000000000000000000000000000000s'
        );

        expect(formatCaptureInterval('10000000000000000000000000000m')).toBe(
            '10000000000000000000000000000m'
        );
    });
});

describe('parsePostgresInterval', () => {
    test('returns an empty object when the interval is not valid', () => {
        expect(parsePostgresInterval(`11.22.33.444`)).toEqual({});
        expect(parsePostgresInterval(`this will not parse`)).toEqual({});
    });

    describe('returns a DurationObjectUnits', () => {
        test('when the interval is valid', () => {
            expect(parsePostgresInterval(`T11:22:00.123`)).toEqual({
                hours: 11,
                minutes: 22,
                seconds: 0,
                milliseconds: 123,
            });

            expect(parsePostgresInterval(`T00:00:11.123`)).toEqual({
                hours: 0,
                minutes: 0,
                seconds: 11,
                milliseconds: 123,
            });

            expect(parsePostgresInterval(`T00:00:00.000`)).toEqual({
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
            });
        });

        test('and will remove all 0s if told', () => {
            expect(parsePostgresInterval(`T11:22:00.123`, true)).toEqual({
                hours: 11,
                minutes: 22,
                seconds: undefined,
                milliseconds: 123,
            });

            expect(parsePostgresInterval(`T00:00:11.123`, true)).toEqual({
                hours: undefined,
                minutes: undefined,
                seconds: 11,
                milliseconds: 123,
            });

            expect(parsePostgresInterval(`T00:00:00.000`, true)).toEqual({
                hours: undefined,
                minutes: undefined,
                seconds: undefined,
                milliseconds: undefined,
            });
        });
    });
});
