import type { Dispatch, SetStateAction } from 'react';
import type { CompositeProjection } from 'src/components/editor/Bindings/FieldSelection/types';
import type {
    FieldSelectionDictionary,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';
import type { FieldOutcome } from 'src/types/wasm';

export interface AlgorithmOutcomeContentProps {
    fieldSelection: FieldSelectionDictionary;
    outcomes: FieldOutcome[];
}

export interface AlgorithmOutcomeDialogProps extends BaseProps {
    closeMenu: () => void;
    open: boolean;
    selectedAlgorithm: SelectionAlgorithm | null;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface BaseProps {
    bindingUUID: string;
    loading: boolean;
    projections: CompositeProjection[] | null | undefined;
}

export interface FieldOutcomesProps {
    fields: string[];
    headerMessageId: string;
    keyPrefix: string;
    outcomes: FieldOutcome[];
    hideBorder?: boolean;
}

export interface GenerateButtonProps extends BaseProps {
    closeMenu: () => void;
    selectedAlgorithm: SelectionAlgorithm | null;
}

export interface MenuActionProps extends BaseProps {
    closeMenu: () => void;
}

export interface SaveButtonProps extends BaseProps {
    close: () => void;
    fieldSelection: FieldSelectionDictionary;
    selectedAlgorithm: SelectionAlgorithm | null;
}
