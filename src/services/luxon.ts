import type { DateTimeUnit, DurationObjectUnits, ToRelativeUnit } from 'luxon';

import { DateTime, Duration } from 'luxon';

import { DataGrains } from 'src/components/graphs/types';

export interface LuxonGrainSettings {
    longFormat: (val: DateTime) => string;
    shortFormat: (val: DateTime) => string;
    getTimeZone: (val: DateTime) => string;
    labelKey: string;
    relativeUnit: ToRelativeUnit;
    timeUnit: DateTimeUnit;
    selectedLabelKey?: string; // Mainly for "Yearly" selection where "13 months" felt weird displaying
}

// Reference for formatting
// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
const dayAndMonthFormat = `LLL dd`;
const timeZoneFormat = `ZZZZ`;
export const defaultQueryDateFormat = `yyyy-MM-dd'T'HH:mm:ssZZ`;

const DAILY_GRAIN_SETTINGS: LuxonGrainSettings = {
    relativeUnit: 'days',
    timeUnit: 'day',
    labelKey: 'detailsPanel.recentUsage.filter.label.days',
    getTimeZone: (val) => val.toUTC().toFormat(timeZoneFormat),
    longFormat: (val) => val.toUTC().toLocaleString(DateTime.DATE_HUGE),
    shortFormat: (val) => val.toUTC().toFormat(dayAndMonthFormat),
};

export const LUXON_GRAIN_SETTINGS: {
    [k in DataGrains]: LuxonGrainSettings;
} = {
    [DataGrains.daily]: DAILY_GRAIN_SETTINGS,
    [DataGrains.hourly]: {
        relativeUnit: 'hours',
        timeUnit: 'hour',
        labelKey: 'detailsPanel.recentUsage.filter.label.hours',
        getTimeZone: (val) => val.toFormat(timeZoneFormat),
        longFormat: (val) =>
            val
                .setLocale(navigator.language ?? 'en-US')
                .toLocaleString(DateTime.DATETIME_FULL),
        shortFormat: (val) =>
            val
                .setLocale(navigator.language ?? 'en-US')
                .toLocaleString(DateTime.TIME_SIMPLE),
    },
    [DataGrains.monthly]: {
        ...DAILY_GRAIN_SETTINGS,
        relativeUnit: 'months',
        timeUnit: 'month',
        labelKey: 'detailsPanel.recentUsage.filter.label.months',
        selectedLabelKey: 'detailsPanel.recentUsage.filter.label.year',
        longFormat: (val) =>
            val
                .toUTC()
                .setLocale(navigator.language ?? 'en-US')
                .toLocaleString({ month: 'long', year: 'numeric' }),
        shortFormat: (val) =>
            val
                .toUTC()
                .setLocale(navigator.language ?? 'en-US')
                .toLocaleString({ month: 'short' }),
    },
};

// Spells out a duration in whole units, leaving out the units that are zero.
// Luxon's own `toHuman` keeps them, which turns a few seconds into
// "0 days, 0 hours, 0 minutes, 3 seconds".
//
// `maxUnits` keeps only that many of the largest units still standing, so a long
// span reads as "1 day, 6 hours" instead of trailing minutes and seconds that add
// no information at that scale. Omit it to spell out every unit.
// Based on https://github.com/moment/luxon/issues/1134#issuecomment-1668033880
export const toHumanDuration = (
    duration: Duration,
    { maxUnits }: { maxUnits?: number } = {}
): string => {
    const units = duration
        .shiftTo('days', 'hours', 'minutes', 'seconds')
        .toObject();

    if ('seconds' in units) {
        units.seconds = Math.round(units.seconds!);
    }

    // `shiftTo` orders the units largest first, and dropping the zeroes preserves
    // that order, so the leading entries are the significant ones.
    const significant = Object.entries(units)
        .filter(([_key, value]) => value !== 0)
        .map(([key, value]) => [key, Math.abs(value)]);

    const cleanedDuration = Object.fromEntries(
        maxUnits ? significant.slice(0, maxUnits) : significant
    ) as DurationObjectUnits;

    if (Object.keys(cleanedDuration).length === 0) {
        cleanedDuration.seconds = 0;
    }

    return Duration.fromObject(cleanedDuration).toHuman();
};

// The signed variant: the gap between two moments, worded relative to now with
// an "in "/" ago" affix.
export const toAbsHumanDuration = (start: DateTime, end: DateTime): string => {
    const prefix = start > end ? 'in ' : '';
    const suffix = end > start ? ' ago' : '';

    return `${prefix}${toHumanDuration(end.diff(start))}${suffix}`;
};
