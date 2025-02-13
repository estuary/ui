import { DateTime, Interval } from 'luxon';
import { getTrialDuration } from 'utils/env-utils';

const { trialDuration } = getTrialDuration();

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
