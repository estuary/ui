import type { PrefixSubscription } from 'src/utils/notification-utils';

export interface RowProps {
    row: [string, PrefixSubscription];
}

export interface RowsProps {
    data: [string, PrefixSubscription][];
}
