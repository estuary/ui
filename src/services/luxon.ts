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
    selectedLabelKey: string | null; // Mainly for "Yearly" selection where "13 months" felt weird displaying
}

// Reference for formatting
// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
const dayAndMonthFormat = `LLL dd`;
const timeZoneFormat = `ZZZZ`;
export const defaultQueryDateFormat = `yyyy-MM-dd'T'HH:mm:ssZZ`;
export const dayAndTimeFormat = `${dayAndMonthFormat} HH:mm:ssZZZZ`;

const DAILY_GRAIN_SETTINGS: LuxonGrainSettings = {
    relativeUnit: 'days',
    timeUnit: 'day',
    labelKey: 'detailsPanel.recentUsage.filter.label.days',
    getTimeZone: (val) => val.toUTC().toFormat(timeZoneFormat),
    longFormat: (val) => val.toUTC().toLocaleString(DateTime.DATE_HUGE),
    shortFormat: (val) => val.toUTC().toFormat(dayAndMonthFormat),
    selectedLabelKey: null,
};

export const LUXON_GRAIN_SETTINGS: {
    [k in DataGrains]: LuxonGrainSettings;
} = {
    [DataGrains.daily]: DAILY_GRAIN_SETTINGS,
    [DataGrains.hourly]: {
        relativeUnit: 'hours',
        timeUnit: 'hour',
        labelKey: 'detailsPanel.recentUsage.filter.label.hours',
        selectedLabelKey: null,
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
                .setLocale(navigator.language ?? 'en-US')
                .toLocaleString({ month: 'long', year: 'numeric' }),
        shortFormat: (val) =>
            val
                .setLocale(navigator.language ?? 'en-US')
                .toLocaleString({ month: 'short' }),
    },
};

// Based on https://github.com/moment/luxon/issues/1134#issuecomment-1668033880
export const toAbsHumanDuration = (start: DateTime, end: DateTime): string => {
    // Better Duration.toHuman support https://github.com/moment/luxon/issues/1134
    const duration = end
        .diff(start)
        .shiftTo('days', 'hours', 'minutes', 'seconds')
        .toObject();

    const prefix = start > end ? 'in ' : '';
    const suffix = end > start ? ' ago' : '';

    if ('seconds' in duration) {
        duration.seconds = Math.round(duration.seconds!);
    }

    const cleanedDuration = Object.fromEntries(
        Object.entries(duration)
            .filter(([_key, value]) => value !== 0)
            .map(([key, value]) => [key, Math.abs(value)])
    ) as DurationObjectUnits;

    if (Object.keys(cleanedDuration).length === 0) {
        cleanedDuration.seconds = 0;
    }

    const human = Duration.fromObject(cleanedDuration).toHuman();
    return `${prefix}${human}${suffix}`;
};
