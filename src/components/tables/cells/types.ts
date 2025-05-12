import type { CSSProperties } from 'react';

export type CSSTextProperties = Partial<
    Pick<CSSProperties, 'color' | 'fontStyle' | 'fontWeight' | 'textTransform'>
>;

export interface EditableFieldProps {
    field: string;
    pointer: string | undefined;
    fieldTextStyles?: CSSTextProperties;
    readOnly?: boolean;
    sticky?: boolean;
}
