type PrefixedName_ErrorStates =
    | 'missing'
    | 'invalid'
    | 'unclean'
    | 'endingSlash';
export type PrefixedName_Errors = PrefixedName_ErrorStates[] | null;
export type PrefixedName_Change = (
    prefixedName: string,
    errorString: string | null,
    errorTypes: {
        prefix?: PrefixedName_Errors;
        name?: PrefixedName_Errors;
    }
) => void;

export interface PrefixedNameProps {
    label: string | null;
    entityType?: string;
    allowBlankName?: boolean;
    allowEndSlash?: boolean;
    defaultPrefix?: boolean;
    disabled?: boolean;
    hideErrorMessage?: boolean;
    onChange?: PrefixedName_Change;
    onNameChange?: PrefixedName_Change;
    onPrefixChange?: PrefixedName_Change;
    prefixOnly?: boolean;
    required?: boolean;
    showDescription?: boolean;
    size?: 'small' | 'medium';
    standardVariant?: boolean;
    validateOnLoad?: boolean;
    value?: string;
}

export interface PrefixSelectorProps
    extends Pick<PrefixedNameProps, 'disabled' | 'label' | 'value'> {
    error: boolean;
    labelId: string;
    onChange: (newVal: any) => void;
    options: string[];
    variantString?: 'standard' | 'outlined';
}
