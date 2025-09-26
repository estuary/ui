import type {
    FieldSelection,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';

export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface AlgorithmMenuProps extends BaseMenuProps {
    targetFieldsRecommended?: boolean;
}

interface BaseMenuProps {
    handleClick: (recommended: boolean | number) => void;
    disabled: boolean;
}

export interface ExcludeAllButtonProps {
    bindingUUID: string;
    loading: boolean;
    selections: FieldSelection[] | null | undefined;
}

export interface MenuActionProps extends BaseMenuProps {
    close: () => void;
}

export interface SaveButtonProps extends MenuActionProps {
    selectedAlgorithm: SelectionAlgorithm | null;
}
