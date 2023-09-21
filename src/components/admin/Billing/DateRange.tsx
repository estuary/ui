import {
    endOfMonth,
    getMonth,
    parseISO,
    startOfDay,
    startOfMonth,
} from 'date-fns';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { stripTimeFromDate } from 'utils/billing-utils';

interface Props {
    start_date: string;
    end_date: string;
}

const getUTCDate = (date: Date) => {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
};

function DateRange({ start_date, end_date }: Props) {
    const intl = useIntl();
    const [parsed_start, parsed_end] = useMemo(
        () => [
            getUTCDate(parseISO(start_date)),
            getUTCDate(parseISO(end_date)),
        ],
        [end_date, start_date]
    );

    // If the start and end dates are the start and end of the same month,
    // we just need to show that month
    if (
        startOfDay(parsed_start).getTime() ===
            startOfDay(startOfMonth(parsed_start)).getTime() &&
        startOfDay(parsed_end).getTime() ===
            startOfDay(endOfMonth(parsed_end)).getTime() &&
        getMonth(parsed_start) === getMonth(parsed_end)
    ) {
        return (
            <strong>
                {' '}
                {intl.formatDate(stripTimeFromDate(start_date), {
                    year: 'numeric',
                    month: 'long',
                })}
            </strong>
        );
    } else {
        return (
            <>
                {' '}
                <strong>
                    {intl.formatDate(stripTimeFromDate(start_date), {
                        year: 'numeric',
                        month: 'long',
                    })}
                </strong>
                {' — '}
                <strong>
                    {intl.formatDate(stripTimeFromDate(end_date), {
                        year: 'numeric',
                        month: 'long',
                    })}
                </strong>
            </>
        );
    }
}

export default DateRange;
