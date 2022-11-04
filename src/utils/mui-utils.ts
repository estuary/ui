import { AutocompleteChangeReason } from '@mui/material';
import { KeyboardEvent, SyntheticEvent } from 'react';

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
