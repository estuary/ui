import { AccessGrantRemovalDescription } from 'hooks/useAccessGrantRemovalDescriptions';
import { ReactNode } from 'react';
import { RowConfirmation } from '../types';

export interface AccessGrantRowConfirmation extends RowConfirmation<ReactNode> {
    details: AccessGrantRemovalDescription;
}

export interface GrantWhatIsChangingProps {
    identifier: string;
    capability: string;
    grantScope: string;
}
