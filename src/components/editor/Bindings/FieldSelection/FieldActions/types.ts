import { SelectionAlgorithm } from 'stores/Binding/slices/FieldSelection';
import { CompositeProjection, FieldSelectionType } from '../types';

export interface BaseProps {
    bindingUUID: string;
    loading: boolean;
    projections: CompositeProjection[] | null | undefined;
}

export interface MenuActionProps extends BaseProps {
    closeMenu: () => void;
}

export interface MenuOptionProps {
    descriptionId: string;
    labelId: string;
    value: SelectionAlgorithm;
}

export interface SaveButtonProps extends MenuActionProps {
    selectedValue: FieldSelectionType;
}
