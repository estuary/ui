import { DateTime, Interval } from 'luxon';

const trialDuration = import.meta.env.VITE_TRIAL_DURATION;

export const isBeforeTrialInterval = (timestamp: string | undefined) => {
    return (
        typeof timestamp === 'string' &&
        Interval.fromDateTimes(
            DateTime.utc().minus({ days: trialDuration }),
            DateTime.utc()
        ).isAfter(
            DateTime.fromISO(timestamp, {
                zone: 'utc',
            })
        )
    );
};
