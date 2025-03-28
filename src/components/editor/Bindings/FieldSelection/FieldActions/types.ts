import type { CompositeProjection } from 'src/components/editor/Bindings/FieldSelection/types';
import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';

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
