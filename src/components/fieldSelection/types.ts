import type { Dispatch, SetStateAction } from 'react';
import type {
    FieldSelection,
    GroupKeyMetadata,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';

export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface AlgorithmMenuProps extends BaseMenuProps {
    targetFieldsRecommended?: boolean;
}

export interface BaseButtonProps {
    bindingUUID: string;
    loading: boolean;
    selections: FieldSelection[] | null | undefined;
}

interface BaseMenuProps {
    handleClick: (recommended: boolean | number) => void;
    disabled: boolean;
}

export interface GroupByKeysFormProps {
    groupBy: GroupKeyMetadata;
    localValues: FieldSelection[];
    options: FieldSelection[];
    setLocalValues: Dispatch<SetStateAction<FieldSelection[]>>;
}

export interface GroupByKeysSaveButtonProps extends BaseButtonProps {
    close: () => void;
}

export interface MenuActionProps extends BaseMenuProps {
    close: () => void;
}

export interface MenuHeaderProps {
    headerId: string;
    targetFieldsRecommended?: boolean;
}

export interface SaveButtonProps extends MenuActionProps {
    selectedAlgorithm: SelectionAlgorithm | null;
}
