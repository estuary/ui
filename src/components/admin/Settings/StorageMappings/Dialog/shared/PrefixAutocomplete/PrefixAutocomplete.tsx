import { useMemo, useRef, useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { AnimatedHelperText } from 'src/components/shared/AnimatedHelperText';

interface PrefixAutocompleteProps {
    leaves: string[];
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    label: string;
    required?: boolean;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
}

export function PrefixAutocomplete({
    leaves,
    value,
    onChange,
    onBlur,
    label,
    required = false,
    error = false,
    errorMessage,
    helperText,
}: PrefixAutocompleteProps) {
    const filteredOptionsRef = useRef<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const displayMessage = errorMessage ?? helperText;

    const branches = useMemo(() => {
        const allBranches = new Set<string>();

        for (const leaf of leaves) {
            const parts = leaf.split('/').filter(Boolean);
            let path = '';
            for (const part of parts) {
                path += `${part}/`;
                allBranches.add(path);
            }
        }

        return Array.from(allBranches).sort((a, b) => {
            const depthA = a.split('/').length;
            const depthB = b.split('/').length;
            return depthA - depthB || a.localeCompare(b);
        });
    }, [leaves]);

    return (
        <Autocomplete
            sx={{ mb: 0, pb: 0 }}
            freeSolo
            autoHighlight
            value={null}
            options={branches}
            open={isOpen}
            onOpen={() => {
                setIsOpen(true);
            }}
            onClose={(_event, reason) => {
                if (
                    reason === 'selectOption' &&
                    filteredOptionsRef.current.length > 1
                ) {
                    return;
                }
                setIsOpen(false);
            }}
            filterOptions={(options) => {
                const input = value ?? '';
                const filtered = options.filter(
                    (option: string) =>
                        option.startsWith(input) && option !== input
                );
                filteredOptionsRef.current = filtered;
                return filtered;
            }}
            renderOption={(props, option, { index }) => (
                <li {...props}>{option}</li>
            )}
            inputValue={value ?? ''}
            onInputChange={(_event, newInputValue, _reason) => {
                onChange(newInputValue);
            }}
            onChange={(_event, newValue) => {
                onChange(newValue ?? '');
            }}
            onBlur={() => {
                if (value && !value.endsWith('/')) {
                    onChange(`${value}/`);
                }
                onBlur?.();
            }}
            renderInput={(params) => (
                <>
                    <TextField
                        {...params}
                        label={label}
                        required={required}
                        error={error}
                        size="small"
                        inputProps={{
                            ...params.inputProps,
                            onKeyDown: (
                                event: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                                if (
                                    event.key === 'Tab' &&
                                    event.shiftKey &&
                                    value
                                ) {
                                    event.preventDefault();
                                    // Remove trailing slash, then everything after the last slash
                                    const trimmed = value.endsWith('/')
                                        ? value.slice(0, -1)
                                        : value;
                                    const lastSlash = trimmed.lastIndexOf('/');
                                    onChange(
                                        lastSlash >= 0
                                            ? trimmed.slice(0, lastSlash + 1)
                                            : ''
                                    );
                                }
                                (
                                    params.inputProps as Record<
                                        string,
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        any
                                    >
                                )?.onKeyDown?.(event);
                            },
                        }}
                    />
                    <AnimatedHelperText
                        error={error}
                        message={displayMessage}
                    />
                </>
            )}
        />
    );
}
