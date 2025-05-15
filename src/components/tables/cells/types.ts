import type { CSSProperties } from 'react';

export interface AliasListProps {
    field: string;
    pointer: string | undefined;
}

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
