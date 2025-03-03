import { AccessGrantRemovalDescription } from 'hooks/useAccessGrantRemovalDescriptions';
import { ReactNode } from 'react';
import { Capability } from 'types';
import { RowConfirmation } from '../types';

export interface AccessGrantRowConfirmation extends RowConfirmation<ReactNode> {
    details: AccessGrantRemovalDescription;
}

export interface GrantWhatIsChangingProps {
    identifier: string;
    capability: Capability;
    grantScope: string;
}
