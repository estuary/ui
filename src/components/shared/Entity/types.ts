import type { ReactNode } from 'react';
import type {
    EntitySaveButtonProps,
    EntityTestButtonProps,
} from 'src/components/shared/Entity/Actions/types';
import type { DataPlaneOption } from 'src/stores/DetailsForm/types';
import type { FormError } from 'src/stores/FormState/types';
import type { Entity } from 'src/types';
import type { SpecDef } from 'src/types/schemaModels';
import type { Result } from 'src/types/utils';

export interface WrittenDraft {
    draftId: string;
    catalogName: string;
    // The spec as it was written to the draft
    specDef: SpecDef;
    // A new draft was started, so the capture needs a discover
    discoverRequired?: boolean;
}

// Writes the workflow's task into its draft (useWriteCaptureDraft or
// useWriteMaterializationDraft)
export type WriteDraftFn = () => Promise<Result<WrittenDraft, FormError>>;

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
    PrimaryButtonComponent?: any;
    SecondaryButtonComponent?: any;
    hideLogs?: boolean;
    waitTimes?: {
        generate?: number;
    };
}

export type EntityToolbarActionProps = Pick<
    EntityToolbarProps,
    | 'GenerateButton'
    | 'PrimaryButtonComponent'
    | 'SecondaryButtonComponent'
    | 'primaryButtonProps'
    | 'secondaryButtonProps'
>;

export type EntityToolbarProgressProps = Pick<EntityToolbarProps, 'waitTimes'>;

export interface LogDialogActionsProps {
    close: any;
    hideButtons?: boolean;
}

export interface TableHydratorProps {
    disableQueryParamHack?: boolean;
    entity?: Entity;
    selectedCollections: string[];
}
