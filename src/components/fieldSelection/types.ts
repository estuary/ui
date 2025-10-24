import type { Dispatch, SetStateAction } from 'react';
import type {
    FieldSelection,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';

export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface BaseButtonProps {
    bindingUUID: string;
    loading: boolean;
    selections: FieldSelection[] | null | undefined;
}

export interface BaseMenuProps {
    handleClick: (recommended: boolean | number) => void;
    disabled: boolean;
    bindingUUID?: string;
    targetFieldsRecommended?: boolean;
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
}

export interface MenuHeaderProps {
    headerId: string;
    targetFieldsRecommended?: boolean;
}

export interface MenuOptionsProps {
    bindingUUID?: string;
}

export interface SaveButtonProps extends MenuActionProps {
    selectedAlgorithm: SelectionAlgorithm | null;
}
