import { format } from 'date-fns';

import { stringifyJSON } from 'src/services/stringify';

const CARD_DATE_FORMAT = `EEEE, MMM do, yyyy 'at' hh:mm:ss aa`;

export const HEIGHT = 600;

export const formatDate = (date?: string) => {
    return date ? format(new Date(date), CARD_DATE_FORMAT) : 'unknown';
};

// This is weird but required. Otherwise we get "null" printed in the editor.
export const getSpecAsString = (spec: any): string =>
    spec ? (stringifyJSON(spec) ?? '') : '';
