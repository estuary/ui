import type { SyntheticEvent } from 'react';

export type Scopes = 'page' | 'all';

export interface CollectionSelectorHeaderToggleProps {
    itemType: string;
    onClick: (event: SyntheticEvent, value: boolean, scope: Scopes) => void;
    disabled?: boolean;
    defaultValue: boolean;
}
