import type {
    LogLevelFilter,
    LogLevels,
} from 'src/components/tables/Logs/types';
import type { OpsLogFlowDocument } from 'src/types';

import { DateTime } from 'luxon';

import { MEGABYTE } from 'src/utils/dataPlane-utils';

// The amount of data we try to load in each chunk when reading logs
export const maxBytes = Math.round(MEGABYTE / 10);

// When a level filter is on, older chunks can contain nothing that matches. We keep
//  reading backwards automatically until this many bytes go by without a match, then
//  wait for the user to ask us to keep searching.
export const MAX_BYTES_SCANNED_WITHOUT_MATCH = MEGABYTE;

export const DEFAULT_LOG_LEVEL_FILTER: LogLevelFilter = 'all';

export const logMatchesFilter = (level: LogLevels, filter: LogLevelFilter) => {
    if (filter === 'all') {
        return true;
    }

    if (filter === 'warn') {
        return level === 'error' || level === 'warn';
    }

    return level === 'error';
};

// The height we set each row in the logs table
//  we also use this for math and checking if a
//  row should render expanded
export const DEFAULT_ROW_HEIGHT = 55;
export const DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS = 35;
export const WAITING_ROW_HEIGHT = 37; // This is just a bit taller due to the spinner used

export const UUID_START_OF_LOGS = 'UI-start-of-logs';
export const UUID_OLDEST_LOG = 'UI-oldest-log-line';
export const UUID_NEWEST_LOG = 'UI-newest-log-line';

export const EXPAND_ROW_TRANSITION = 200;

export const VIRTUAL_TABLE_BODY_PADDING = 10;

// The store sets scroll targets as indexes into the unfiltered rows (index 0 is the
//  fake oldest row, so documents start at index 1). This maps one onto the filtered
//  rows: the target row if it is visible, otherwise the next visible row after it.
export const toFilteredIndex = (
    documents: OpsLogFlowDocument[] | null,
    filter: LogLevelFilter,
    unfilteredIndex: number
) => {
    if (filter === 'all' || !documents || unfilteredIndex <= 0) {
        return unfilteredIndex;
    }

    let visibleBefore = 0;
    const end = Math.min(unfilteredIndex - 1, documents.length);
    for (let i = 0; i < end; i++) {
        if (logMatchesFilter(documents[i].level, filter)) {
            visibleBefore += 1;
        }
    }

    return visibleBefore + 1;
};

// Matches the log rows (UTC) without the milliseconds, plus a relative hint.
//  Ex: 2026-10-08 14:02:11 UTC (3 hours ago)
export const formatSearchedBackTo = (ts: string) => {
    const dt = DateTime.fromISO(ts, { zone: 'UTC' });

    if (!dt.isValid) {
        return null;
    }

    const relative = dt.toRelative();

    return `${dt.toFormat('yyyy-LL-dd HH:mm:ss ZZZZ')}${relative ? ` (${relative})` : ''}`;
};
