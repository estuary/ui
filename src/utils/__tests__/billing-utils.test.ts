import { stripTimeFromDate } from 'src/utils/billing-utils';

describe('stripTimeFromDate', () => {
    test('strips time component and returns a Date', () => {
        const result = stripTimeFromDate('2024-01-15T10:30:00Z');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(0); // January
        expect(result.getDate()).toBe(15);
    });

    test('handles date-only strings without a time component', () => {
        const result = stripTimeFromDate('2024-06-01T00:00:00');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(5); // June
        expect(result.getDate()).toBe(1);
    });

    test('ignores timezone offset in input', () => {
        const result = stripTimeFromDate('2023-12-31T23:59:59+05:00');
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(11); // December
        expect(result.getDate()).toBe(31);
    });
});
