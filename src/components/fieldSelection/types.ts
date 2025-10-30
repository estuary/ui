import type { Dispatch, SetStateAction } from 'react';
import type {
    FieldSelection,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';

export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface AlgorithmMenuProps extends BaseMenuProps {
    bindingUUID?: string;
    targetFieldsRecommended?: boolean;
}

export interface BaseButtonProps {
    bindingUUID: string;
    loading: boolean;
    selections: FieldSelection[] | null | undefined;
}

export interface BaseMenuProps {
    handleClick: (recommended: boolean | number) => void;
    disabled: boolean;
}

export interface DefinedKeyProps {
    bindingUUID: string;
}

export interface ExistingKeyProps {
    labelId: string;
    values: string[];
}

export interface GroupByKeysFormProps {
    localValues: FieldSelection[];
    options: FieldSelection[];
    setLocalValues: Dispatch<SetStateAction<FieldSelection[]>>;
}

export interface GroupByKeysSaveButtonProps extends BaseButtonProps {
    close: () => void;
}

export interface KeyChangeAlertProps {
    bindingUUID: string;
}

export interface MenuActionProps extends BaseMenuProps {
    close: () => void;
    selectionAlgorithm: SelectionAlgorithm | null;
}

export interface MenuOptionsProps {
    selectionAlgorithm: SelectionAlgorithm | null;
    setSelectionAlgorithm: Dispatch<SetStateAction<SelectionAlgorithm | null>>;
}
