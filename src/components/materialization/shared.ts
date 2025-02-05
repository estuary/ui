import { DateTime, Interval } from 'luxon';

export const isBeforeTrialInterval = (timestamp: string | undefined) => {
    return (
        typeof timestamp === 'string' &&
        Interval.fromDateTimes(
            DateTime.utc().minus({ days: 20 }),
            DateTime.utc()
        ).isAfter(
            DateTime.fromISO(timestamp, {
                zone: 'utc',
            })
        )
    );
};
