import type { PopoverOrigin } from '@mui/material';

import { hasLength } from 'src/utils/misc-utils';
import { DATE_TIME_RE } from 'src/validation';

export const CLEAR_BUTTON_ID_SUFFIX = '__clear-button';
export const INVALID_DATE = 'Invalid Date';
export const TIMEZONE_OFFSET_REPLACEMENT = 'Z';

export const MINUTES_STEP = 5;

export const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
    vertical: 'center',
    horizontal: 'right',
};
export const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = {
    vertical: 'center',
    horizontal: 'left',
};

// TODO (time travel)
// Never fully tested or implemented
export const validateDateTime = (value: string, allowBlank?: boolean): any => {
    const isBlank = !hasLength(value);

    // See iff this field is allowed to be blank
    if (!allowBlank && isBlank) {
        return ['missing'];
    }

    // Check the date is the correct format
    if (!isBlank && !DATE_TIME_RE.test(value)) {
        return ['invalid'];
    }

    return null;
};
