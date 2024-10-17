import { DataGrains } from 'components/graphs/types';
import { DateTime, DateTimeUnit, ToRelativeUnit } from 'luxon';

export interface RangeSettings {
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

const DAILY_RANGE_SETTINGS: RangeSettings = {
    relativeUnit: 'days',
    timeUnit: 'day',
    labelKey: 'detailsPanel.recentUsage.filter.label.days',
    getTimeZone: (val) => val.toUTC().toFormat(timeZoneFormat),
    longFormat: (val) => val.toUTC().toLocaleString(DateTime.DATE_HUGE),
    shortFormat: (val) => val.toUTC().toFormat(dayAndMonthFormat),
};

export const BASE_RANGE_SETTINGS: {
    [k in DataGrains]: RangeSettings;
} = {
    [DataGrains.daily]: DAILY_RANGE_SETTINGS,
    [DataGrains.hourly]: {
        relativeUnit: 'hours',
        timeUnit: 'hour',
        labelKey: 'detailsPanel.recentUsage.filter.label.hours',
        getTimeZone: (val) => val.toFormat(timeZoneFormat),
        longFormat: (val) => val.toLocaleString(DateTime.DATETIME_SHORT),
        shortFormat: (val) => val.toLocaleString(DateTime.TIME_SIMPLE),
    },
    [DataGrains.monthly]: {
        ...DAILY_RANGE_SETTINGS,
        relativeUnit: 'months',
        timeUnit: 'month',
        labelKey: 'detailsPanel.recentUsage.filter.label.months',
    },
};
