import { format } from 'date-fns';

const CARD_DATE_FORMAT = `EEEE, MMM do, yyyy 'at' hh:mm:ss aa`;

export const HEIGHT = 400;

export const formatDate = (date?: string) => {
    return date ? format(new Date(date), CARD_DATE_FORMAT) : 'unknown';
};
