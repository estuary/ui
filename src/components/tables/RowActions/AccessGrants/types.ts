import { AccessGrantRemovalDescription } from 'hooks/useAccessGrantRemovalDescriptions';
import { ReactNode } from 'react';
import { RowConfirmation } from '../types';

export type AccessGrantRowConfirmation = RowConfirmation<
    ReactNode,
    AccessGrantRemovalDescription
>;
