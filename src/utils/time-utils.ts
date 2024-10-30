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

const getNumericSegment = (value: string) => {
    const numericSegment = Number(value);

    return Number.isSafeInteger(numericSegment) ? numericSegment : -1;
};

const parsePostgresInterval = (interval: string): SegmentedInterval => {
    const [hours, minutes, seconds] = interval
        .split(':')
        .map((segment) => getNumericSegment(segment));

    return { h: hours, m: minutes, s: seconds };
};

const parseCaptureInterval = (interval: string): SegmentedInterval => {
    let hours = -1;
    let minutes = -1;
    let seconds = -1;

    interval.split(' ').forEach((segment) => {
        const value = segment.substring(0, segment.length - 1);
        const numericSegment = getNumericSegment(value);

        if (segment.endsWith('h')) {
            hours = numericSegment;
        } else if (segment.endsWith('m')) {
            minutes = numericSegment;
        } else if (segment.endsWith('s')) {
            seconds = numericSegment;
        }
    });

    return { h: hours, m: minutes, s: seconds };
};

export const getCaptureIntervalSegment = (interval: string, unit: string) => {
    let truncatedInterval = -1;

    const granularTimeUnit = unit === 'h' || unit === 'm' || unit === 's';

    if (granularTimeUnit && POSTGRES_INTERVAL_RE.test(interval)) {
        truncatedInterval = parsePostgresInterval(interval)[unit];
    } else if (granularTimeUnit && CAPTURE_INTERVAL_RE.test(interval)) {
        truncatedInterval = parseCaptureInterval(interval)[unit];
    }

    return truncatedInterval;
};

export const formatCaptureInterval = (
    interval: string | null | undefined,
    intervalUnitSupported?: boolean
): string | null => {
    if (typeof interval !== 'string') {
        return null;
    }

    const segments: string[] = [];

    if (POSTGRES_INTERVAL_RE.test(interval)) {
        const {
            h: hours,
            m: minutes,
            s: seconds,
        } = parsePostgresInterval(interval);

        if (hours > 0) {
            segments.push(`${hours}h`);
        }

        if (minutes > 0) {
            segments.push(`${minutes}m`);
        }

        if (seconds > 0) {
            segments.push(`${seconds}s`);
        }
    } else if (CAPTURE_INTERVAL_RE.test(interval)) {
        segments.push(interval);
    }

    let formattedInterval = segments.join(' ').trim();

    if (
        hasLength(formattedInterval) &&
        intervalUnitSupported &&
        !DURATION_RE.test(formattedInterval)
    ) {
        formattedInterval = formattedInterval.concat('i');
    }

    return hasLength(formattedInterval) ? formattedInterval : interval;
};
