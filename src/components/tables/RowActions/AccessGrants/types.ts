import { AccessGrantRemovalDescription } from 'src/hooks/useAccessGrantRemovalDescriptions';
import { ReactNode } from 'react';
import { SelectTableStoreNames } from 'src/stores/names';
import { Capability } from 'src/types';
import { RowConfirmation } from '../types';

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
