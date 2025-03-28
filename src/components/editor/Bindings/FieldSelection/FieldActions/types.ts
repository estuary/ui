import { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';
import { CompositeProjection } from '../types';

export interface BaseProps {
    bindingUUID: string;
    loading: boolean;
    projections: CompositeProjection[] | null | undefined;
}

export interface MenuActionProps extends BaseProps {
    closeMenu: () => void;
}

export interface SaveButtonProps extends MenuActionProps {
    selectedAlgorithm: SelectionAlgorithm | null;
}
