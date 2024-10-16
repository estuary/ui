import { DataByHourRange, DataGrains } from 'components/graphs/types';
import { DateTimeUnit, ToRelativeUnit } from 'luxon';

export interface RangeSettings extends DataByHourRange {
    formatPattern: string;
    relativeUnit: ToRelativeUnit;
    timeUnit: DateTimeUnit;
}

// Reference for formatting
// https://moment.github.io/luxon/#/formatting?id=table-of-tokens
export const defaultQueryDateFormat = `yyyy-MM-dd'T'HH:mm:ss'Z'`;

export const convertRangeToSettings = (
    range: DataByHourRange
): RangeSettings => {
    switch (range.grain) {
        case DataGrains.hourly:
            return {
                ...range,
                formatPattern: `t`,
                relativeUnit: 'hours',
                timeUnit: 'hour',
            };
        case DataGrains.daily:
            return {
                ...range,
                formatPattern: `D`,
                relativeUnit: 'days',
                timeUnit: 'day',
            };
        case DataGrains.monthly:
            return {
                ...range,
                formatPattern: `D`,
                relativeUnit: 'months',
                timeUnit: 'month',
            };
        default:
            throw new Error('Unsupported DataByHourRange grain');
    }
};
