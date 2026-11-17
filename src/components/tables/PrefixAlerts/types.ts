import type { Dispatch, SetStateAction } from 'react';
import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';

export interface RowProps {
    row: Pick<SubscriptionMetadata, 'subscriptions'>;
}

export interface RowsProps {
    data: Pick<SubscriptionMetadata, 'subscriptions'>[];
}

export interface TableFilterProps {
    disabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}
