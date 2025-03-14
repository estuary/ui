import { CompositeProjection, FieldSelectionType } from '../types';

export interface BaseProps {
    bindingUUID: string;
    loading: boolean;
    projections: CompositeProjection[] | null | undefined;
}

export interface MenuActionsProps extends BaseProps {
    closeMenu: () => void;
}

export interface SaveButtonProps extends BaseProps {
    selectedValue: FieldSelectionType;
}
