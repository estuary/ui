import { DataByHourRange, DataGrains } from 'components/graphs/types';
import { DateTime, DateTimeUnit, ToRelativeUnit } from 'luxon';

export interface RangeSettings extends DataByHourRange {
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

export const convertRangeToSettings = (
    range: DataByHourRange
): RangeSettings => {
    switch (range.grain) {
        case DataGrains.hourly:
            return {
                ...range,
                relativeUnit: 'hours',
                timeUnit: 'hour',
                labelKey: 'detailsPanel.recentUsage.filter.label.hours',
                getTimeZone: (val) => val.toFormat(timeZoneFormat),
                longFormat: (val) =>
                    val.toLocaleString(DateTime.DATETIME_SHORT),
                shortFormat: (val) => val.toFormat(`t`),
            };
        case DataGrains.daily:
            return {
                ...range,
                relativeUnit: 'days',
                timeUnit: 'day',
                labelKey: 'detailsPanel.recentUsage.filter.label.days',
                getTimeZone: (val) => val.toUTC().toFormat(timeZoneFormat),
                longFormat: (val) =>
                    val.toUTC().toLocaleString(DateTime.DATE_HUGE),
                shortFormat: (val) => val.toUTC().toFormat(dayAndMonthFormat),
            };
        case DataGrains.monthly:
            return {
                ...range,
                relativeUnit: 'months',
                timeUnit: 'month',
                labelKey: 'detailsPanel.recentUsage.filter.label.months',
                getTimeZone: (val) => val.toUTC().toFormat(timeZoneFormat),
                longFormat: (val) =>
                    val.toUTC().toLocaleString(DateTime.DATE_HUGE),
                shortFormat: (val) => val.toUTC().toFormat(dayAndMonthFormat),
            };
        default:
            throw new Error('Unsupported DataByHourRange grain');
    }
};
