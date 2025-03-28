import { Duration, DurationObjectUnits } from 'luxon';
import { CAPTURE_INTERVAL_RE } from 'src/validation';
import { hasLength } from './misc-utils';

export const parsePostgresInterval = (
    interval: string,
    removeZeros?: boolean
): DurationObjectUnits => {
    const intervalObject = Duration.fromISOTime(interval).toObject();

    if (removeZeros) {
        Object.entries(intervalObject).forEach(([timeUnit, unitValue]) => {
            if (unitValue === 0) {
                intervalObject[timeUnit] = undefined;
            }
        });
    }

    return intervalObject;
};

export const formatCaptureInterval = (
    interval: string | null | undefined
): string | null => {
    if (typeof interval !== 'string') {
        return null;
    }

    let formattedInterval = '';

    if (CAPTURE_INTERVAL_RE.test(interval)) {
        formattedInterval = interval.trim();
    }

    return hasLength(formattedInterval) ? formattedInterval : interval;
};
