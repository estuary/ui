import type { ReactNode } from 'react';
import type {
    EntitySaveButtonProps,
    EntityTestButtonProps,
} from 'src/components/shared/Entity/Actions/types';
import type { DataPlaneOption } from 'src/stores/DetailsForm/types';
import type { BaseComponentProps, Entity } from 'src/types';

export interface AddCollectionDialogCTAProps {
    entity?: Entity;
    toggle: (show: boolean) => void;
}

export interface DataPlaneIconProps {
    scope: DataPlaneOption['scope'];
    hideScopeIcon?: boolean;
    provider?: string;
    size?: 20 | 30;
}

export interface DataPlaneProps {
    formattedSuffix: string;
    scope: DataPlaneOption['scope'];
    dataPlaneName?: DataPlaneOption['dataPlaneName'];
    hidePrefix?: boolean;
    hideScopeIcon?: DataPlaneIconProps['hideScopeIcon'];
    logoSize?: DataPlaneIconProps['size'];
}

export interface EntityToolbarProps {
    GenerateButton: ReactNode;
    primaryButtonProps: EntitySaveButtonProps | any;
    secondaryButtonProps: EntityTestButtonProps | any;
    expressWorkflow?: boolean;
    PrimaryButtonComponent?: any;
    SecondaryButtonComponent?: any;
    hideLogs?: boolean;
    waitTimes?: {
        generate?: number;
    };
}

export type EntityToolbarActionProps = Pick<
    EntityToolbarProps,
    | 'expressWorkflow'
    | 'GenerateButton'
    | 'PrimaryButtonComponent'
    | 'SecondaryButtonComponent'
    | 'primaryButtonProps'
    | 'secondaryButtonProps'
>;

export type EntityToolbarProgressProps = Pick<EntityToolbarProps, 'waitTimes'>;

export interface LogDialogActionsProps {
    close: any;
    closeCtaKey?: string;
    hideButtons?: boolean;
}

export interface TableHydratorProps {
    disableQueryParamHack?: boolean;
    entity?: Entity;
    selectedCollections: string[];
}

export interface WorkflowInitializerProps extends BaseComponentProps {
    expressWorkflow?: boolean;
}
