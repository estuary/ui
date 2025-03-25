import type { AccessGrantRemovalDescription } from 'hooks/useAccessGrantRemovalDescriptions';
import type { ReactNode } from 'react';
import type { SelectTableStoreNames } from 'stores/names';
import type { Capability } from 'types';
import type { RowConfirmation } from '../types';

export interface AccessGrantRowConfirmation extends RowConfirmation<ReactNode> {
    details: AccessGrantRemovalDescription;
}

export interface GrantWhatIsChangingProps {
    identifier: string;
    capability: Capability;
    grantScope: string;
}

export interface AccessGrantDeleteButtonProps {
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
}
