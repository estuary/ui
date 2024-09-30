import { DataPlaneOption } from 'stores/DetailsForm/types';
import { Entity } from 'types';

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
    hideScopeIcon?: DataPlaneIconProps['hideScopeIcon'];
    logoSize?: DataPlaneIconProps['size'];
}

export interface TableHydratorProps {
    disableQueryParamHack?: boolean;
    entity?: Entity;
    selectedCollections: string[];
}
