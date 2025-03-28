import type { ReactNode } from 'react';
import type { RowConfirmation } from 'src/components/tables/RowActions/types';
import type { AccessGrantRemovalDescription } from 'src/hooks/useAccessGrantRemovalDescriptions';
import type { SelectTableStoreNames } from 'src/stores/names';
import type { Capability } from 'src/types';

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
