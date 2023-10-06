import { PopoverOrigin } from '@mui/material';
import { DATE_TIME_PATTERN, hasLength } from 'utils/misc-utils';

export const INVALID_DATE = 'Invalid Date';
export const TIMEZONE_OFFSET_REPLACEMENT = 'Z';

export const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
    vertical: 'center',
    horizontal: 'left',
};
export const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = {
    vertical: 'center',
    horizontal: 'right',
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
    const DATE_TIME_RE = new RegExp(`^(${DATE_TIME_PATTERN}$`);
    if (!isBlank && !DATE_TIME_RE.test(value)) {
        return ['invalid'];
    }

    return null;
};
