import type { AutoCompleteOption } from 'src/components/materialization/source/targetSchema/types';

// Need to keep in sync with - estuary/flow/crates/models/src/source_capture.rs
export const targetNamingOptions = [
    'prefixSchema',
    'prefixNonDefaultSchema',

    // fromSourceName renamed to withSchema
    'fromSourceName',
    'withSchema',

    // leaveEmpty renamed to noSchema
    'noSchema',
    'leaveEmpty',
] as const;

// Functions to handle the old aliases. Keeping them together so they are easier to stay in sync
export const filterAliases = (choice: string) => {
    return choice !== 'leaveEmpty' && choice !== 'fromSourceName';
};

export const compareOptionsIncludingAliases = (
    option: AutoCompleteOption,
    optionVal: AutoCompleteOption
) => {
    if (optionVal.val === 'leaveEmpty') {
        return option.val === 'noSchema';
    }

    if (optionVal.val === 'fromSourceName') {
        return option.val === 'noSchema';
    }

    return option.val === optionVal.val;
};
