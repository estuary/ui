import { ReactNode } from 'react';
import { Entity } from 'types';
import { EntitySaveButtonProps, EntityTestButtonProps } from './Actions/types';

export interface AddCollectionDialogCTAProps {
    entity?: Entity;
    toggle: (show: boolean) => void;
}

export interface EntityToolbarProps {
    GenerateButton: ReactNode;
    primaryButtonProps: EntitySaveButtonProps | any;
    secondaryButtonProps: EntityTestButtonProps | any;
    PrimaryButtonComponent?: any;
    SecondaryButtonComponent?: any;
    hideLogs?: boolean;
    waitTimes?: {
        generate?: number;
    };
}

export interface LogDialogActionsProps {
    close: any;
    closeCtaKey?: string;
    materialize?: {
        action: () => Promise<void>;
        title: string;
    };
}

export interface TableHydratorProps {
    disableQueryParamHack?: boolean;
    entity?: Entity;
    selectedCollections: string[];
}
