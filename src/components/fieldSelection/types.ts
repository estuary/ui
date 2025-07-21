import type { Dispatch, SetStateAction } from 'react';
import type {
    ExpandedFieldSelection,
    FieldSelectionDictionary,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';
import type { Schema } from 'src/types';

// The constraint types are ordered by severity, with one being the most severe and six the least.
export enum ConstraintTypes {
    UNSATISFIABLE = 1,
    FIELD_FORBIDDEN = 2,
    FIELD_OPTIONAL = 3,
    LOCATION_RECOMMENDED = 4,
    LOCATION_REQUIRED = 5,
    FIELD_REQUIRED = 6,
}

export type ConstraintType = keyof typeof ConstraintTypes;
export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface AlgorithmOutcomeContentProps {
    fieldSelection: FieldSelectionDictionary;
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
    selections: ExpandedFieldSelection[] | null | undefined;
}

export interface BuiltSpec_Binding {
    collection: Collection;
    fieldSelection: FieldSelection;
    journalReadSuffix: string;
    partitionSelector: any;
    resourceConfig: any;
    resourcePath: string[];
}

interface Collection {
    ackTemplate: any;
    key: string[];
    name: string;
    partitionTemplate: any;
    projections: Projection[];
    uuidPtr: string;
    writeSchema: Schema;
}

export interface CompositeProjection extends Projection {
    constraint: TranslatedConstraint | null;
    selectionType: FieldSelectionType | null;
    selectionMetadata?: Schema;
}

export interface Constraint {
    type: ConstraintType;
    reason: string;
}

export interface ConstraintDictionary {
    [key: string]: Constraint;
}

export interface FieldOutcomesProps {
    headerMessageId: string;
    selections: ExpandedFieldSelection[];
    keyPrefix: string;
    hideBorder?: boolean;
}

export interface FieldSelection {
    keys: string[];
    values: string[];
    document: string;
    fieldConfig?: { [field: string]: any };
}

export interface GenerateButtonProps extends BaseProps {
    closeMenu: () => void;
    selectedAlgorithm: SelectionAlgorithm | null;
}

export interface MenuActionProps extends BaseProps {
    closeMenu: () => void;
}

export interface Projection {
    field: string;
    inference: any;
    ptr?: string;
    isPrimaryKey?: boolean;
}

export interface SaveButtonProps extends BaseProps {
    close: () => void;
    fieldSelection: FieldSelectionDictionary;
    selectedAlgorithm: SelectionAlgorithm | null;
}

export interface TranslatedConstraint {
    type: ConstraintTypes;
    reason: string;
}

export interface ValidationResponse_Binding {
    constraints: ConstraintDictionary;
    resourcePath: string[];
}
