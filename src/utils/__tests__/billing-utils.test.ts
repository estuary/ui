import {
    formatDataVolumeForDisplay,
    formatDateForApi,
    invoiceId,
    stripTimeFromDate,
    type SeriesConfig,
} from 'src/utils/billing-utils';

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

describe('formatDateForApi', () => {
    test('formats a Date to the expected API string format', () => {
        const date = new Date(2024, 0, 15); // Jan 15 2024 local time
        expect(formatDateForApi(date)).toBe('2024-01-15 00:00:00+00');
    });

    test('pads single-digit months and days', () => {
        const date = new Date(2024, 2, 5); // March 5 2024
        expect(formatDateForApi(date)).toBe('2024-03-05 00:00:00+00');
    });

    test('handles end-of-year dates', () => {
        const date = new Date(2023, 11, 31); // Dec 31 2023
        expect(formatDateForApi(date)).toBe('2023-12-31 00:00:00+00');
    });
});

describe('formatDataVolumeForDisplay', () => {
    const makeSeries = (
        overrides: Partial<SeriesConfig> = {}
    ): SeriesConfig => ({
        data: [
            ['2024-01', 5.5],
            ['2024-02', 10.0],
        ],
        seriesName: 'test-series',
        ...overrides,
    });

    test('returns GB formatted value when dataVolumeInBytes is false', () => {
        const series = [makeSeries()];
        const tooltip = { name: '2024-01', seriesName: 'test-series', value: ['2024-01', 5.5] };
        expect(formatDataVolumeForDisplay(series, tooltip, false)).toBe('5.50 GB');
    });

    test('returns prettyBytes formatted value when dataVolumeInBytes is true', () => {
        const series = [makeSeries({ data: [['2024-01', 1073741824]] })];
        const tooltip = { name: '2024-01', seriesName: 'test-series', value: [] };
        expect(formatDataVolumeForDisplay(series, tooltip, true)).toBe('1.07 GB');
    });

    test('falls back to tooltipConfig value when month is not found in data', () => {
        const series = [makeSeries()];
        const tooltip = { name: '2024-03', seriesName: 'test-series', value: ['2024-03', 7.77] };
        expect(formatDataVolumeForDisplay(series, tooltip)).toBe('7.77 GB');
    });

    test('filters by seriesName when multiple series are present', () => {
        const series = [
            makeSeries({ seriesName: 'series-a', data: [['2024-01', 1.0]] }),
            makeSeries({ seriesName: 'series-b', data: [['2024-01', 99.0]] }),
        ];
        const tooltip = { name: '2024-01', seriesName: 'series-a', value: [] };
        expect(formatDataVolumeForDisplay(series, tooltip, false)).toBe('1.00 GB');
    });

    test('uses single series without filtering by seriesName', () => {
        const series = [makeSeries({ seriesName: 'anything', data: [['2024-01', 3.0]] })];
        const tooltip = { name: '2024-01', seriesName: 'different-name', value: [] };
        expect(formatDataVolumeForDisplay(series, tooltip, false)).toBe('3.00 GB');
    });
});

describe('invoiceId', () => {
    test('concatenates date_start, date_end, and billed_prefix', () => {
        const invoice = {
            date_start: '2024-01-01',
            date_end: '2024-01-31',
            billed_prefix: 'acme/',
        } as any;
        expect(invoiceId(invoice)).toBe('2024-01-01-2024-01-31-acme/');
    });

    test('is unique for different prefixes', () => {
        const base = { date_start: '2024-01-01', date_end: '2024-01-31' } as any;
        expect(invoiceId({ ...base, billed_prefix: 'acme/' })).not.toBe(
            invoiceId({ ...base, billed_prefix: 'other/' })
        );
    });
});
