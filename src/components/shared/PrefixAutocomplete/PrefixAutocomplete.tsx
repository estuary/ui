import { useMemo, useRef, useState } from 'react';

import { Autocomplete, Box, TextField, Typography } from '@mui/material';

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

// Insert <wbr> after each "/" so the browser only wraps at path boundaries
function breakAtSlashes(text: string) {
    const segments = text.split('/');
    return segments.flatMap((seg, i) =>
        i < segments.length - 1 ? [seg, '/', <wbr key={i} />] : [seg]
    );
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

    const msg = errorMessage ?? helperText;
    const displayMessage = msg ? (
        <Markdown options={markdownOptions}>{msg}</Markdown>
    ) : undefined;

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
            value={value}
            options={branches}
            open={isOpen}
            onOpen={() => {
                setIsOpen(true);
            }}
            onClose={(_event, reason) => {
                if (
                    // Leave the dropdown open to progressively narrow options as the user types or makes a selection,
                    // (e.g. the user selects acmeCo/ to narrow the options to acmeCo/finance/ and acmeCo/engineering/)
                    reason === 'selectOption' &&
                    filteredOptionsRef.current.length > 1
                ) {
                    return;
                }
                setIsOpen(false);
            }}
            filterOptions={(options) => {
                const filtered = options.filter(
                    (option: string) =>
                        option.startsWith(value) && option !== value
                );
                filteredOptionsRef.current = filtered;
                return filtered;
            }}
            inputValue={value}
            onInputChange={(_event, newInputValue, _reason) =>
                onChange(newInputValue)
            }
            onChange={(_event, newValue) => onChange(newValue ?? '')}
            onBlur={() => {
                // append trailing slash if not present to adhere to prefix convention.
                // might make sense as a configurable option if we want to use this for catalog_names in the future
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
                        // reserved space for two lines of helper text
                        // and prevent layout shift when text appears
                        sx: { minHeight: '3.4em' },
                    }}
                    size="small"
                />
            )}
            renderOption={(props, option, state) => {
                // styling to help distinguish the current input from the rest of the path in matching options.
                // truncate the matched prefix to just its last two path components (e.g. "acmeCo/prod/anvils/" → "…/prod/anvils/")
                const input = state.inputValue;
                const remainder = option.replace(input, '');

                // separate complete path segments from any partial segment being typed
                const lastSlash = input.lastIndexOf('/');
                const completePath = input.slice(0, lastSlash + 1);
                const partial = input.slice(lastSlash + 1);
                const segments = completePath.split('/').filter(Boolean);

                const truncatedComplete =
                    segments.length > 2
                        ? `\u2026/${segments.slice(-2).join('/')}/`
                        : completePath;
                const truncatedPrefix = truncatedComplete + partial;

                return (
                    <Box component="li" {...props} key={option}>
                        <Typography component="span">
                            <Typography
                                component="span"
                                sx={{ color: 'text.disabled' }}
                            >
                                {breakAtSlashes(truncatedPrefix)}
                            </Typography>
                            {breakAtSlashes(remainder)}
                        </Typography>
                    </Box>
                );
            }}
        />
    );
}
