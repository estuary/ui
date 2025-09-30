import type { Dispatch, SetStateAction } from 'react';
import type {
    FieldSelection,
    GroupKeyMetadata,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';

export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface BaseProps {
    bindingUUID: string;
    loading: boolean;
    selections: FieldSelection[] | null | undefined;
}

export interface GroupByKeysFormProps {
    groupBy: GroupKeyMetadata;
    localValues: FieldSelection[];
    options: FieldSelection[];
    setLocalValues: Dispatch<SetStateAction<FieldSelection[]>>;
}

export interface GroupByKeysSaveButtonProps extends BaseProps {
    close: () => void;
}

export interface MenuActionProps extends BaseProps {
    closeMenu: () => void;
}

export interface SaveButtonProps extends BaseProps {
    close: () => void;
    selectedAlgorithm: SelectionAlgorithm | null;
}
