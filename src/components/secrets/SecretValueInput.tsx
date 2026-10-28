import { useState } from 'react';

import { IconButton, InputAdornment, TextField } from '@mui/material';

import { Eye, EyeClosed } from 'iconoir-react';

interface SecretValueInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    labelledBy?: string;
    helperText?: string;
    disabled?: boolean;
    minRows?: number;
    maxRows?: number;
}

// A textarea masked like a password, so values can span lines
export function SecretValueInput({
    value,
    onChange,
    label,
    labelledBy,
    helperText,
    disabled,
    minRows,
    maxRows,
}: SecretValueInputProps) {
    const [showValue, setShowValue] = useState(false);

    return (
        <TextField
            label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            multiline
            minRows={minRows}
            maxRows={maxRows}
            size="small"
            required
            autoFocus
            disabled={disabled}
            helperText={helperText}
            sx={
                showValue
                    ? undefined
                    : { '& textarea': { WebkitTextSecurity: 'disc' } }
            }
            slotProps={{
                // Keep the value out of LogRocket and PostHog, and out of
                // browser autofill and spellcheck services.
                htmlInput: {
                    'aria-labelledby': labelledBy,
                    'data-private': true,
                    'className': 'ph-no-capture',
                    'autoComplete': 'new-password',
                    'autoCorrect': 'off',
                    'autoCapitalize': 'off',
                    'spellCheck': false,
                    'data-1p-ignore': true,
                    'data-lpignore': true,
                    'data-bwignore': true,
                    'data-form-type': 'other',
                },
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={
                                    showValue ? 'Hide value' : 'Show value'
                                }
                                onClick={() => setShowValue((shown) => !shown)}
                                edge="end"
                                size="small"
                            >
                                {showValue ? <EyeClosed /> : <Eye />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}
