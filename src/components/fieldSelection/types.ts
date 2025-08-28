import type {
    FieldSelection,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';

export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface BaseProps {
    bindingUUID: string;
    loading: boolean;
    selections: FieldSelection[] | null | undefined;
}

export interface MenuActionProps extends BaseProps {
    closeMenu: () => void;
}

export interface SaveButtonProps extends BaseProps {
    close: () => void;
    selectedAlgorithm: SelectionAlgorithm | null;
}
