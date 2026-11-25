import type { ReactNode } from 'react';

import { useState } from 'react';

import Close from '@mui/icons-material/Close';
import { IconButton, InputAdornment, TextField, useTheme } from '@mui/material';

import { Eye, EyeClosed } from 'iconoir-react';

interface SecretValueInputProps {
    value: string;
    label?: string;
    helperText?: ReactNode;
    disabled?: boolean;
    multiline?: boolean;
    autoFocus?: boolean;
    required?: boolean;
    error?: boolean;
    placeholder?: string;
    onChange: (value: string) => void;
    onClear?: () => void;
}

export function SecretValueInput({
    value,
    onChange,
    label,
    helperText,
    disabled,
    multiline,
    autoFocus,
    required,
    error,
    placeholder,
    onClear,
}: SecretValueInputProps) {
    const theme = useTheme();
    const [showValue, setShowValue] = useState(false);
    const [hovered, setHovered] = useState(false);

    return (
        <TextField
            label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            multiline={multiline}
            minRows={multiline ? 1 : undefined}
            maxRows={multiline ? 5 : undefined}
            size="small"
            fullWidth
            required={required}
            autoFocus={autoFocus}
            error={error}
            placeholder={placeholder}
            disabled={disabled}
            helperText={helperText}
            sx={
                showValue
                    ? undefined
                    : {
                          '& textarea, & input': {
                              WebkitTextSecurity: 'disc',
                          },
                      }
            }
            slotProps={{
                // The hint isn't the error, so it keeps its color
                formHelperText: { error: false },
                // A placeholder only shows with the label above the input
                inputLabel: { shrink: placeholder ? true : undefined },
                // Keep the value out of LogRocket and PostHog, and out of
                // browser autofill and spellcheck services.
                htmlInput: {
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
                    // Like the text inputs, the clear button shows on hover
                    onPointerEnter: () => setHovered(true),
                    onPointerLeave: () => setHovered(false),
                    // Nothing to reveal until a value is entered; stored
                    // secrets are never decrypted here
                    endAdornment: value ? (
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
                    ) : onClear ? (
                        // Out of the layout, like the text inputs' clear
                        // button, so showing it doesn't shift the input
                        <InputAdornment
                            position="end"
                            style={{
                                display: hovered ? 'flex' : 'none',
                                position: 'absolute',
                                right: 0,
                            }}
                        >
                            <IconButton
                                aria-label="Clear secret"
                                onClick={onClear}
                                disabled={disabled}
                                size="large"
                            >
                                {/* Matches the text inputs' clear button */}
                                <Close
                                    style={{
                                        background:
                                            theme.palette.background.default,
                                        borderRadius: '50%',
                                    }}
                                />
                            </IconButton>
                        </InputAdornment>
                    ) : undefined,
                },
            }}
        />
    );
}
