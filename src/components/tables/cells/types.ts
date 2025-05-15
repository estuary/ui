import type { CSSProperties } from 'react';

export type CSSTextProperties = Partial<
    Pick<CSSProperties, 'color' | 'fontStyle' | 'fontWeight' | 'textTransform'>
>;

export interface EditableFieldProps {
    field: string;
    pointer: string | undefined;
    fieldTextStyles?: CSSTextProperties;
    rawNameOnly?: boolean;
    readOnly?: boolean;
    sticky?: boolean;
}

export interface FieldListProps {
    field: string;
    pointer: string | undefined;
    deletable?: boolean;
    diminishedText?: boolean;
}
