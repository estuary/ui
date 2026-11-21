import type {
    StatsWindow,
    UsageGrain,
} from 'src/hooks/billing/useTaskUsageStats';

import { DateTime } from 'luxon';

import { formatDayRange } from 'src/components/admin/Billing/shared/format';

// Every date here is the start of a UTC day, as billing and stats use.

export type PresetKey = 'this' | 'last' | 'three' | 'six' | 'twelve';

export type PeriodSelection =
    | { preset: PresetKey }
    // Inclusive, as yyyy-MM-dd.
    | { preset: 'custom'; from: string; to: string };

export interface UsagePeriod {
    preset: PresetKey | 'custom';
    from: DateTime;
    // The last day, inclusive.
    to: DateTime;
}

export interface UsageBucket {
    start: DateTime;
    // The last day of the period in the bucket, inclusive.
    end: DateTime;
    // `start` as yyyy-MM-dd, which is how stats name their buckets.
    key: string;
    // A day of this month still to come, drawn as an empty slot.
    future: boolean;
}

export interface BucketLayout {
    grain: UsageGrain;
    buckets: UsageBucket[];
}

export const PRESETS: { key: PresetKey; label: string }[] = [
    { key: 'this', label: 'This month' },
    { key: 'last', label: 'Last month' },
    { key: 'three', label: 'Last 3 months' },
    { key: 'six', label: 'Last 6 months' },
    { key: 'twelve', label: 'Last 12 months' },
];

// The longest period read and drawn a day at a time. Longer ones go by month,
// which keeps a year of a task's stats to a dozen buckets.
const MAX_DAILY_DAYS = 92;

// How far back the tab reads, counting the current month.
const MONTHS_BACK = 12;

const format = (date: DateTime, pattern: string) =>
    date.toFormat(pattern, { locale: 'en-US' });

export const isoDay = (date: DateTime) => format(date, 'yyyy-MM-dd');

export const parseDay = (day: string) => DateTime.fromISO(day, { zone: 'utc' });

export const countDays = (from: DateTime, to: DateTime) =>
    Math.round(to.diff(from, 'days').days) + 1;

const lastDayOfMonth = (date: DateTime) => date.endOf('month').startOf('day');

export const firstUsageDay = (today: DateTime) =>
    today.startOf('month').minus({ months: MONTHS_BACK - 1 });

export function presetRange(preset: PresetKey, today: DateTime) {
    const month = today.startOf('month');

    switch (preset) {
        case 'this':
            return { from: month, to: today };
        case 'last':
            return {
                from: month.minus({ months: 1 }),
                to: month.minus({ days: 1 }),
            };
        case 'three':
            return { from: month.minus({ months: 2 }), to: today };
        case 'six':
            return { from: month.minus({ months: 5 }), to: today };
        case 'twelve':
            return { from: month.minus({ months: 11 }), to: today };
    }
}

export function resolvePeriod(
    selection: PeriodSelection,
    today: DateTime
): UsagePeriod {
    return selection.preset === 'custom'
        ? {
              preset: 'custom',
              from: parseDay(selection.from),
              to: parseDay(selection.to),
          }
        : {
              preset: selection.preset,
              ...presetRange(selection.preset, today),
          };
}

// The selection for a range picked by hand: a preset when it matches one, so
// "Nov 1 to today" reads as This month. Monthly stats cover whole months only,
// so a range too long for daily buckets widens to the months it touches.
export function selectRange(
    from: DateTime,
    to: DateTime,
    today: DateTime
): PeriodSelection {
    let start = DateTime.max(DateTime.min(from, to), firstUsageDay(today));
    let end = DateTime.min(DateTime.max(from, to), today);

    if (countDays(start, end) > MAX_DAILY_DAYS) {
        start = start.startOf('month');
        end = DateTime.min(lastDayOfMonth(end), today);
    }

    const match = PRESETS.find(({ key }) => {
        const range = presetRange(key, today);

        return +range.from === +start && +range.to === +end;
    });

    return match
        ? { preset: match.key }
        : { preset: 'custom', from: isoDay(start), to: isoDay(end) };
}

// A bucket per day up to MAX_DAILY_DAYS, per month beyond, unless
// `grainOverride` says otherwise. This month also shows its days to come.
export function getBucketLayout(
    period: UsagePeriod,
    today: DateTime,
    grainOverride?: UsageGrain
): BucketLayout {
    const last = period.preset === 'this' ? lastDayOfMonth(today) : period.to;
    const grain: UsageGrain =
        grainOverride ??
        (countDays(period.from, last) <= MAX_DAILY_DAYS ? 'DAILY' : 'MONTHLY');

    const buckets: UsageBucket[] = [];
    let start = grain === 'DAILY' ? period.from : period.from.startOf('month');

    while (start <= last) {
        const end = grain === 'DAILY' ? start : lastDayOfMonth(start);

        buckets.push({
            start,
            end: DateTime.min(end, period.to),
            key: isoDay(start),
            future: start > today,
        });

        start =
            grain === 'DAILY'
                ? start.plus({ days: 1 })
                : start.plus({ months: 1 });
    }

    return { grain, buckets };
}

// The stats to read for a period, in whole months when bucketed by month.
export function getStatsWindow(
    period: UsagePeriod,
    grain: UsageGrain
): StatsWindow {
    return grain === 'DAILY'
        ? { grain, start: period.from, end: period.to.plus({ days: 1 }) }
        : {
              grain,
              start: period.from.startOf('month'),
              end: period.to.startOf('month').plus({ months: 1 }),
          };
}

export const periodLabel = (period: UsagePeriod) =>
    PRESETS.find(({ key }) => key === period.preset)?.label ?? 'Custom';

// Nov 1 – 9, 2026
export const formatRange = (from: DateTime, to: DateTime) =>
    formatDayRange(isoDay(from), isoDay(to), true);

// Nov 8 / Nov 2026
export const formatBucketShort = (bucket: UsageBucket, grain: UsageGrain) =>
    format(bucket.start, grain === 'DAILY' ? 'LLL d' : 'LLL yyyy');

// Nov 8 / November 2026 / Nov 1 – 9, 2026 for a month not over yet
export function formatBucketLong(bucket: UsageBucket, grain: UsageGrain) {
    if (grain === 'DAILY') {
        return format(bucket.start, 'LLL d');
    }

    return +bucket.end === +lastDayOfMonth(bucket.start)
        ? format(bucket.start, 'LLLL yyyy')
        : formatRange(bucket.start, bucket.end);
}
