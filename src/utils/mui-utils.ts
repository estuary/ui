import type {
    AutocompleteChangeReason,
    AutocompleteInputChangeReason,
} from '@mui/material';
import type { KeyboardEvent, SyntheticEvent } from 'react';

// This function detects whether the user is attempting to remove
// one of the selected autocomplete options via the backspace key.
// MUI recommended solution to prevent the user from deleting an
// autocomplete option tag.
export const detectRemoveOptionWithBackspace = (
    event: SyntheticEvent,
    reason: AutocompleteChangeReason
) => {
    return (
        event.type === 'keydown' &&
        (event as KeyboardEvent).key === 'Backspace' &&
        reason === 'removeOption'
    );
};

// Allow us to detect when an autocomplete input is getting reset
// after a user has selected
export const detectAutoCompleteInputReset = (
    reason: AutocompleteInputChangeReason
) => {
    return reason === 'reset';
};
