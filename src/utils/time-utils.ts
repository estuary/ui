import { Duration, DurationObjectUnits } from 'luxon';
import { CAPTURE_INTERVAL_RE, POSTGRES_INTERVAL_RE } from 'validation';
import { hasLength } from './misc-utils';

const parsePostgresInterval = (interval: string): DurationObjectUnits => {
    return Duration.fromISOTime(interval).toObject();
};

export const formatCaptureInterval = (
    interval: string | null | undefined
): string | null => {
    if (typeof interval !== 'string') {
        return null;
    }

    let formattedInterval = '';

    if (POSTGRES_INTERVAL_RE.test(interval)) {
        formattedInterval = Duration.fromObject(
            parsePostgresInterval(interval)
        ).toFormat("h'h' m'm' s's'");
    } else if (CAPTURE_INTERVAL_RE.test(interval)) {
        formattedInterval = interval.trim();
    }

    return hasLength(formattedInterval) ? formattedInterval : interval;
};
