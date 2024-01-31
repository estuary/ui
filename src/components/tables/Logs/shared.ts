import { MEGABYTE } from 'utils/dataPlane-utils';

// The amount of data we try to load in each chunk when reading logs
export const maxBytes = Math.round(MEGABYTE / 4);

// The height we set each row in the logs table
//  we also use this for math and checking if a
//  row should render expanded
export const DEFAULT_ROW_HEIGHT = 55;
export const DEFAULT_ROW_HEIGHT_WITHOUT_FIELDS = 35;

export const START_OF_LOGS_UUID = 'UI-start-of-logs';

// Try to keep this close so that the icon rotates just as the height is being adjusted
export const EXPAND_ROW_WAIT = 15;
export const EXPAND_ROW_TRANSITION = 200;
