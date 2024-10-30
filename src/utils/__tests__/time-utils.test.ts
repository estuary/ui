import {
    formatCaptureInterval,
    getCaptureIntervalSegment,
} from 'utils/time-utils';

describe('getCaptureIntervalSegment', () => {
    const postgresInterval = '01:00:00';
    const captureInterval = '1h';

    describe('returns -1', () => {
        test('when the time unit is an empty string', () => {
            const emptyUnit = '';

            expect(getCaptureIntervalSegment(postgresInterval, emptyUnit)).toBe(
                -1
            );

            expect(getCaptureIntervalSegment(captureInterval, emptyUnit)).toBe(
                -1
            );
        });

        test('when the time unit is unsupported', () => {
            const unsupportedUnit = 'z';

            expect(
                getCaptureIntervalSegment(postgresInterval, unsupportedUnit)
            ).toBe(-1);

            expect(
                getCaptureIntervalSegment(captureInterval, unsupportedUnit)
            ).toBe(-1);
        });

        test(`when the time unit is 'i'`, () => {
            const intervalUnit = 'i';

            expect(
                getCaptureIntervalSegment(postgresInterval, intervalUnit)
            ).toBe(-1);

            expect(
                getCaptureIntervalSegment(captureInterval, intervalUnit)
            ).toBe(-1);
        });

        test('when the interval does not contain a segment that corresponds to the time unit', () => {
            expect(getCaptureIntervalSegment('1m 30s', 'h')).toBe(-1);

            expect(getCaptureIntervalSegment(captureInterval, 'm')).toBe(-1);

            expect(getCaptureIntervalSegment(captureInterval, 's')).toBe(-1);
        });

        test('when the interval is not formatted properly', () => {
            const unit = 'm';

            expect(getCaptureIntervalSegment('', unit)).toBe(-1);

            expect(getCaptureIntervalSegment('  ', unit)).toBe(-1);

            expect(getCaptureIntervalSegment('2', unit)).toBe(-1);

            expect(getCaptureIntervalSegment('2a', unit)).toBe(-1);

            expect(getCaptureIntervalSegment('20:00', unit)).toBe(-1);

            expect(getCaptureIntervalSegment('1h2m', unit)).toBe(-1);
        });
    });

    test('returns a positive number when the time unit corresponds to an interval segment that exists', () => {
        expect(getCaptureIntervalSegment('00:01:30', 'h')).toBe(0);

        expect(getCaptureIntervalSegment(postgresInterval, 'm')).toBe(0);

        expect(getCaptureIntervalSegment(postgresInterval, 's')).toBe(0);

        expect(getCaptureIntervalSegment('2m 0s', 's')).toBe(0);

        expect(getCaptureIntervalSegment(postgresInterval, 'h')).toBe(1);

        expect(getCaptureIntervalSegment('00:20:30', 'm')).toBe(20);

        expect(getCaptureIntervalSegment('00:20:30', 's')).toBe(30);

        expect(getCaptureIntervalSegment(captureInterval, 'h')).toBe(1);

        expect(getCaptureIntervalSegment('20m 30s', 'm')).toBe(20);

        expect(getCaptureIntervalSegment('20m 30s', 's')).toBe(30);

        expect(getCaptureIntervalSegment('20m 3000000000s', 's')).toBe(
            3000000000
        );
    });
});

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

    describe('returns the original interval', () => {
        test('when the interval is not in a supported format', () => {
            expect(formatCaptureInterval('  ')).toBe('  ');

            expect(formatCaptureInterval('2')).toBe('2');

            expect(formatCaptureInterval('20:00')).toBe('20:00');

            expect(formatCaptureInterval('1h2m')).toBe('1h2m');
        });

        test('when the interval is 00:00:00', () => {
            expect(formatCaptureInterval('00:00:00')).toBe('00:00:00');
        });
    });

    describe('returns a formatted capture interval', () => {
        test('when the interval is in a supported format and intervalUnitSupported is false', () => {
            expect(formatCaptureInterval('01:20:00')).toBe('1h 20m');

            expect(formatCaptureInterval('01:20:05')).toBe('1h 20m 5s');

            expect(formatCaptureInterval('00:20:00')).toBe('20m');

            expect(formatCaptureInterval('1h 20m')).toBe('1h 20m');

            expect(formatCaptureInterval('1h 20m 5s')).toBe('1h 20m 5s');

            expect(formatCaptureInterval('20m')).toBe('20m');
        });

        test('when the interval is in a supported format, scalar, and intervalUnitSupported is true', () => {
            expect(formatCaptureInterval('01:00:00', true)).toBe('1h');

            expect(formatCaptureInterval('00:20:00', true)).toBe('20m');

            expect(formatCaptureInterval('00:00:05', true)).toBe('5s');

            expect(formatCaptureInterval('1h', true)).toBe('1h');

            expect(formatCaptureInterval('20m', true)).toBe('20m');

            expect(formatCaptureInterval('5s', true)).toBe('5s');
        });
    });

    test(`returns a formatted capture interval appended with 'i' when the interval is in a supported format, compound, and intervalUnitSupported is true`, () => {
        expect(formatCaptureInterval('01:20:00', true)).toBe('1h 20mi');

        expect(formatCaptureInterval('01:20:05', true)).toBe('1h 20m 5si');

        expect(formatCaptureInterval('01:00:05', true)).toBe('1h 5si');

        expect(formatCaptureInterval('1h 20m', true)).toBe('1h 20mi');

        expect(formatCaptureInterval('1h 20m 5s', true)).toBe('1h 20m 5si');

        expect(formatCaptureInterval('1h 5s', true)).toBe('1h 5si');
    });
});
