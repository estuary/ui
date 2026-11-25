// Billing amounts are in US cents and its dates are UTC calendar dates
// (yyyy-MM-dd), so everything here formats for en-US in UTC.

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const wholeUsd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

// Credits read like invoices, with a minus sign: −$115.00.
const withMinusSign = (text: string) => text.replace('-', '−');

// $566.60
export const formatCents = (cents: number) =>
    withMinusSign(usd.format(cents / 100));

// $2,017, for estimates. Amounts that round to zero read $0, not −$0.
export const formatWholeCents = (cents: number) =>
    withMinusSign(wholeUsd.format(Math.abs(cents) < 50 ? 0 : cents / 100));

export const formatNumber = (value: number, fractionDigits = 0) =>
    value.toLocaleString('en-US', { maximumFractionDigits: fractionDigits });

// 24.6 GB, 820 GB, 12.3 TB
export const formatGb = (gb: number) =>
    gb >= 10000
        ? `${formatNumber(gb / 1000, 1)} TB`
        : `${formatNumber(gb, gb < 100 ? 1 : 0)} GB`;

// 1,940 h
export const formatHours = (hours: number) => `${formatNumber(hours)} h`;

export type UsageKind = 'data' | 'hours';

// $0.50/GB, $0.14/h
export const formatRate = (cents: number, kind: UsageKind) =>
    `${usd.format(cents / 100)}/${kind === 'data' ? 'GB' : 'h'}`;

// A tier boundary: 1 TB, 1,024 GB, 4,464 task hours.
export const formatQuantity = (value: number, kind: UsageKind) => {
    if (kind === 'hours') {
        return `${formatNumber(value)} task hours`;
    }

    return value >= 1000 && value % 1000 === 0
        ? `${formatNumber(value / 1000)} TB`
        : `${formatNumber(value)} GB`;
};

// 1 – 5 TB, 4,464 – 13,392 task hours
export const formatQuantityRange = (
    from: number,
    to: number,
    kind: UsageKind
) => {
    if (kind === 'hours') {
        return `${formatNumber(from)} – ${formatNumber(to)} task hours`;
    }

    return from % 1000 === 0 && to % 1000 === 0
        ? `${formatNumber(from / 1000)} – ${formatNumber(to / 1000)} TB`
        : `${formatNumber(from)} – ${formatNumber(to)} GB`;
};

const utcDate = (date: string) => new Date(`${date.slice(0, 10)}T00:00:00Z`);

const dateFormat = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });

const dayFormat = dateFormat({ month: 'short', day: 'numeric' });
const fullDateFormat = dateFormat({
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});
const monthFormat = dateFormat({ month: 'long', year: 'numeric' });
const monthNameFormat = dateFormat({ month: 'long' });

// Nov 1
export const formatDay = (date: string) => dayFormat.format(utcDate(date));

// Nov 1, 2026
export const formatDate = (date: string) =>
    fullDateFormat.format(utcDate(date));

// November 2026
export const formatMonth = (date: string) => monthFormat.format(utcDate(date));

// November
export const formatMonthName = (date: string) =>
    monthNameFormat.format(utcDate(date));

// Nov 1 – 9 or Sep 1 – Nov 9, and with the year Nov 1 – 9, 2026 or
// Dec 1, 2025 – Nov 9, 2026.
export function formatDayRange(from: string, to: string, withYear = false) {
    const year = (date: string) => (withYear ? `, ${date.slice(0, 4)}` : '');

    if (from === to) {
        return `${formatDay(to)}${year(to)}`;
    }

    const head =
        from.slice(0, 4) === to.slice(0, 4)
            ? formatDay(from)
            : `${formatDay(from)}${year(from)}`;
    const tail =
        from.slice(0, 7) === to.slice(0, 7)
            ? String(Number(to.slice(8, 10)))
            : formatDay(to);

    return `${head} – ${tail}${year(to)}`;
}

// Nov 1 – 9, the month so far.
export const formatMonthToDate = (today: string) =>
    formatDayRange(`${today.slice(0, 7)}-01`, today);

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

// Billing months are UTC months, so today is the UTC date.
export const utcToday = () => isoDay(new Date());

// Day 0 of a month is the last day of the month before.
const monthDay = (date: string, months: number, day: number) => {
    const start = utcDate(date);

    return isoDay(
        new Date(
            Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, day)
        )
    );
};

export const nextMonthStart = (date: string) => monthDay(date, 1, 1);

export const previousMonthEnd = (date: string) => monthDay(date, 0, 0);

export const daysBetween = (from: string, to: string) =>
    Math.round((utcDate(to).getTime() - utcDate(from).getTime()) / 86400000);
