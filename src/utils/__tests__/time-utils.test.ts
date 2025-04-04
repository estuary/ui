import { formatCaptureInterval } from 'src/utils/time-utils';

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
