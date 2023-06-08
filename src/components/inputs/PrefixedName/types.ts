type PrefixedName_ErrorStates = 'missing' | 'invalid' | 'unclean';
export type PrefixedName_Errors = PrefixedName_ErrorStates[] | null;
export type PrefixedName_Change = (
    prefixedName: string,
    errorString: string | null,
    errorTypes: {
        prefix?: PrefixedName_Errors;
        name?: PrefixedName_Errors;
    }
) => void;
