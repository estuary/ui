import {
    CAPTURE_INTERVAL_RE,
    DURATION_RE,
    POSTGRES_INTERVAL_RE,
} from 'validation';
import { hasLength } from './misc-utils';

interface SegmentedInterval {
    h: number;
    m: number;
    s: number;
}

const parsePostgresInterval = (interval: string): SegmentedInterval => {
    const [hours, minutes, seconds] = interval.split(':').map((segment) => {
        const numericSegment = Number(segment);

        return isFinite(numericSegment) ? numericSegment : -1;
    });

    return { h: hours, m: minutes, s: seconds };
};

const parseCaptureInterval = (interval: string): SegmentedInterval => {
    let hours = -1;
    let minutes = -1;
    let seconds = -1;

    interval.split(' ').forEach((segment) => {
        const numericSegment = Number(segment.substring(0, segment.length - 1));
        const numericValue = isFinite(numericSegment) ? numericSegment : -1;

        if (segment.includes('h')) {
            hours = numericValue;
        } else if (segment.includes('m')) {
            minutes = numericValue;
        } else if (segment.includes('s')) {
            seconds = numericValue;
        }
    });

    return { h: hours, m: minutes, s: seconds };
};

export const getCaptureIntervalSegment = (interval: string, unit: string) => {
    let truncatedInterval = -1;

    const granularTimeUnit = unit === 'h' || unit === 'm' || unit === 's';

    if (granularTimeUnit && POSTGRES_INTERVAL_RE.test(interval)) {
        const segments = parsePostgresInterval(interval);

        truncatedInterval = segments[unit];
    }

    if (granularTimeUnit && CAPTURE_INTERVAL_RE.test(interval)) {
        const segments = parseCaptureInterval(interval);

        truncatedInterval = segments[unit];
    }

    return truncatedInterval;
};

export const formatCaptureInterval = (
    interval: string | null,
    intervalUnitSupported?: boolean
): string | null => {
    if (typeof interval !== 'string') {
        return interval;
    }

    let formattedInterval = '';

    if (POSTGRES_INTERVAL_RE.test(interval)) {
        const {
            h: hours,
            m: minutes,
            s: seconds,
        } = parsePostgresInterval(interval);

        if (hours > 0) {
            formattedInterval = formattedInterval.concat(`${hours}h `);
        }

        if (minutes > 0) {
            formattedInterval = formattedInterval.concat(`${minutes}m `);
        }

        if (seconds > 0) {
            formattedInterval = formattedInterval.concat(`${seconds}s`);
        }
    }

    if (CAPTURE_INTERVAL_RE.test(interval)) {
        formattedInterval = formattedInterval.concat(interval);
    }

    formattedInterval =
        hasLength(formattedInterval.trim()) &&
        intervalUnitSupported &&
        !DURATION_RE.test(formattedInterval.trim())
            ? formattedInterval.trim().concat('i')
            : formattedInterval.trim();

    return hasLength(formattedInterval) ? formattedInterval : interval;
};
