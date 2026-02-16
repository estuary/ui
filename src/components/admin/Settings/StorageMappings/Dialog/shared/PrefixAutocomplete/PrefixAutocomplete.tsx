import { useMemo, useRef, useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import Markdown from 'markdown-to-jsx';
import { Link } from 'react-router-dom';

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

const markdownOptions = {
    forceInline: true,
    overrides: {
        a: {
            component: ({
                href,
                ...props
            }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
                <Link to={href ?? ''} {...props} />
            ),
        },
    },
};

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
    // MUI Autocomplete doesn't expose the filtered options list to onClose,
    // so we stash it here to decide whether to keep the dropdown open after a selection.
    const filteredOptionsRef = useRef<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const displayMessage = useMemo(() => {
        const msg = errorMessage ?? helperText;
        if (!msg) return undefined;

        return <Markdown options={markdownOptions}>{msg}</Markdown>;
    }, [errorMessage, helperText]);

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

        // sort shallow first, then alphabetically
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
                    // Leave the dropdown open if there are are still options available
                    // (e.g. the user selects acmeCo/ to narrow the options to acmeCo/finance/ and acmeCo/engineering/)
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
                <TextField
                    {...params}
                    label={label}
                    required={required}
                    error={error}
                    helperText={displayMessage ?? ' '}
                    FormHelperTextProps={{
                        sx: { minHeight: '3.4em' },
                    }}
                    size="small"
                />
            )}
        />
    );
}
