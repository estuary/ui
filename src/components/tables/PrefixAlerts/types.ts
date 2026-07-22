import type { Dispatch, SetStateAction } from 'react';
import type { SubscriptionMetadata } from 'src/components/admin/Settings/PrefixAlerts/types';

export interface RowProps {
    row: SubscriptionMetadata;
}

export interface RowsProps {
    data: SubscriptionMetadata[];
}

export interface TableFilterProps {
    disabled: boolean;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}
