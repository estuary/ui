import type { DateTimeUnit, ToRelativeUnit } from 'luxon';

import { DateTime } from 'luxon';

import { DataGrains } from 'src/components/graphs/types';

export interface LuxonGrainSettings {
    longFormat: (val: DateTime) => string;
    shortFormat: (val: DateTime) => string;
    getTimeZone: (val: DateTime) => string;
    labelKey: string;
    relativeUnit: ToRelativeUnit;
    timeUnit: DateTimeUnit;
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
    },
};
