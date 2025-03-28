import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { logRocketConsole } from 'src/services/shared';
import { stripTimeFromDate } from 'src/utils/billing-utils';

interface Props {
    start_date: string;
    end_date: string;
}

const getMonth = (date: string) => {
    return DateTime.fromISO(date).startOf('month').month;
};

// TODO (MessageWithEmphasis) we can use MessageWithEmphasis as the basis of this
//  I think not including the hyphens in the `strong` just adds complexity that is not totally needed
//  So to simplify I think we can create two messages that handle the two main cases below
//      and just pass in the {start_date} and {end_date} as values.
function DateRange({ start_date, end_date }: Props) {
    const intl = useIntl();
    const [startMonth, endMonth] = useMemo(() => {
        const response = [getMonth(start_date), getMonth(end_date)];

        logRocketConsole('Date range parsing', {
            start_date,
            end_date,
            response,
        });

        return response;
    }, [end_date, start_date]);

    if (startMonth === endMonth) {
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
