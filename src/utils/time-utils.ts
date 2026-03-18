import type { DurationObjectUnits } from 'luxon';

import { Duration } from 'luxon';

import { hasLength } from 'src/utils/misc-utils';
import { CAPTURE_INTERVAL_RE } from 'src/validation';

export const parsePostgresInterval = (
    interval: string,
    removeZeros?: boolean
): DurationObjectUnits => {
    const intervalObject = Duration.fromISOTime(interval).toObject();

    if (removeZeros) {
        (
            Object.entries(intervalObject) as [
                keyof typeof intervalObject,
                number | undefined,
            ][]
        ).forEach(([timeUnit, unitValue]) => {
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
