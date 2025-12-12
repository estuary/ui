import type { ReactNode } from 'react';
import type { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
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

export interface ProgressProps {
    error: any | null;
    item: string | ReactNode;
    progress: ProgressStates;
    runningIntlKey: string;
    successIntlKey: string;
    renderError?: Function;
}

export interface RevokeGrantProps {
    grant: AccessGrantRowConfirmation;
    onFinish: (response: any) => void;
    runningIntlKey: string;
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
    successIntlKey: string;
}

export interface RowSelectorProps {
    additionalCTA: ReactNode;
    selectTableStoreName:
        | SelectTableStoreNames.ACCESS_GRANTS_USERS
        | SelectTableStoreNames.ACCESS_GRANTS_PREFIXES;
}
