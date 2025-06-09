import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';

// Need to keep in sync with - estuary/flow/crates/models/src/source_capture.rs
// The order that these appear in here is the order they show in the dashboard
export const targetNamingOptions = [
    'prefixSchema',
    'prefixNonDefaultSchema',

    // fromSourceName renamed to withSchema
    'fromSourceName',
    'withSchema',

    // leaveEmpty renamed to noSchema
    'leaveEmpty',
    'noSchema',
] as const;

// Functions to handle the old aliases. Keeping them together so they are easier to stay in sync
const filterAliases = (choice: string) => {
    return choice !== 'leaveEmpty' && choice !== 'fromSourceName';
};

export const filteredTargetNamingOptions =
    targetNamingOptions.filter(filterAliases);

export const compareOptionsIncludingAliases = (
    option: AutoCompleteOptionForTargetSchema,
    optionVal: AutoCompleteOptionForTargetSchema
) => {
    if (optionVal.val === 'leaveEmpty') {
        return option.val === 'noSchema';
    }

    if (optionVal.val === 'fromSourceName') {
        return option.val === 'withSchema';
    }

    return option.val === optionVal.val;
};
