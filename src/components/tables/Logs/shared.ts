import { MEGABYTE } from 'src/utils/dataPlane-utils';

// The amount of data we try to load in each chunk when reading logs
export const maxBytes = Math.round(MEGABYTE / 10);

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
