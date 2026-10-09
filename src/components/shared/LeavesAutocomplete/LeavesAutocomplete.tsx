import type { TextFieldVariants } from '@mui/material';

import { useMemo, useRef, useState } from 'react';

import { Autocomplete, Box, Link, TextField, Typography } from '@mui/material';

import Markdown from 'markdown-to-jsx';
import { Link as RouterLink } from 'react-router-dom';

import {
    appendWithForwardSlash,
    normalizeCatalogName,
} from 'src/utils/misc-utils';
import { breakAtSlashes } from 'src/utils/path-utils';

type MuiKeyboardEvent = React.KeyboardEvent & {
    // MUI adds this flag to keyboard events so our Enter handler can tell the
    // autocomplete to skip its built-in handling. preventDefault() alone won't do that
    defaultMuiPrevented?: boolean;
};

interface LeavesAutocompleteProps {
    leaves: string[];
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    label: string;
    required?: boolean;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    textFieldVariant?: TextFieldVariants;
}

// The prefix one level up: "acmeCo/prod/" -> "acmeCo/", "acmeCo/" -> "".
// This is to support the shift-tab behavior, allowing the user to go back up one level in the prefix hierarchy.
function parentPrefix(prefix: string): string {
    const withoutTrailingSlash = prefix.endsWith('/')
        ? prefix.slice(0, -1)
        : prefix;
    const lastSlash = withoutTrailingSlash.lastIndexOf('/');

    return lastSlash === -1 ? '' : withoutTrailingSlash.slice(0, lastSlash + 1);
}

const markdownOptions = {
    forceInline: true,
    overrides: {
        a: {
            component: ({
                href,
                ...props
            }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
                <Link component={RouterLink} to={href ?? ''} {...props} />
            ),
        },
    },
};

export function LeavesAutocomplete({
    leaves,
    value,
    onChange,
    onBlur,
    label,
    required = false,
    error = false,
    errorMessage,
    helperText,
    textFieldVariant,
}: LeavesAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Enter is used to select the highlighted value _and_ blur the component (to dismiss the popup).
    // This ref keeps track of what was picked on exit so that blur doesn't use the value that was in the input before Enter was pressed.
    const pickedOnExit = useRef<string | null>(null);

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

    // The source of truth used by both the popup and the Tab-to-select handler.
    const offered = useMemo(
        () => branches.filter((b) => b.startsWith(value) && b !== value),
        [branches, value]
    );

    // Find MUI's highlighted option so Tab can select it.
    // aria-activedescendant identifies its element; data-option-index
    // maps that element back to the filtered options.
    const highlightedOption = (input: HTMLInputElement) => {
        const activeId = input.getAttribute('aria-activedescendant');
        const index = activeId
            ? document
                  .getElementById(activeId)
                  ?.getAttribute('data-option-index')
            : null;

        return index === null || index === undefined
            ? undefined
            : offered[Number(index)];
    };

    return (
        <Autocomplete
            sx={{ mb: 0, pb: 0 }}
            freeSolo
            disableClearable
            autoHighlight
            onKeyDown={(event) => {
                const input = event.target as HTMLInputElement;

                if (event.key === 'Enter') {
                    // Enter selects the highlighted option and leaves/blurs the field.
                    // `defaultMuiPrevented` tells MUI's Autocomplete to skip its built-in Enter handling.
                    (event as MuiKeyboardEvent).defaultMuiPrevented = true;

                    const picked = highlightedOption(input);

                    if (picked !== undefined) {
                        pickedOnExit.current = picked;
                        onChange(picked);
                    }

                    input.blur();
                    return;
                }

                if (event.key !== 'Tab') {
                    // arrow keys fall through to MUI's default handling.
                    return;
                }

                // event.key === 'Tab' at this point.
                if (event.shiftKey) {
                    // Shift+Tab walks back up the prefix hierarchy.
                    const parent = parentPrefix(value);

                    // Already at the root, so let Shift+Tab step back out of
                    // the field.
                    if (parent === value) {
                        return;
                    }

                    event.preventDefault();
                    onChange(parent);
                    return;
                }

                // Tab selects the highlighted option and leaves the menu open with the next child highlighted.
                const picked = highlightedOption(input);

                // Nothing to select, so let Tab move focus on as usual — the
                // field must not trap a keyboard user.
                if (picked === undefined) {
                    return;
                }

                event.preventDefault();
                onChange(picked);
            }}
            value={value}
            options={branches}
            open={isOpen}
            onOpen={() => {
                setIsOpen(true);
            }}
            disableCloseOnSelect={true}
            filterOptions={() => offered}
            inputValue={value}
            onInputChange={(_event, newInputValue, _reason) =>
                onChange(normalizeCatalogName(newInputValue))
            }
            onChange={(_event, newValue) => {
                onChange(newValue ?? '');
            }}
            onClose={() => setIsOpen(false)}
            onBlur={() => {
                setIsOpen(false);

                // Whatever the field is leaving on: the option Enter just took,
                // or the text the prop still holds.
                const leavingWith = pickedOnExit.current ?? value;
                pickedOnExit.current = null;

                // append trailing slash if not present to adhere to prefix convention.
                // might make sense as a configurable option if we want to use this for catalog_names in the future
                const appendedVal = appendWithForwardSlash(leavingWith);
                if (appendedVal && appendedVal !== leavingWith) {
                    onChange(appendedVal);
                }
                onBlur?.();
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    required={required}
                    error={error}
                    // single space string to make sure helper text is present and taking up minHeight defined below
                    helperText={displayMessage ?? ' '}
                    slotProps={{
                        formHelperText: {
                            // reserved space for two lines of helper text
                            // and prevent layout shift when text appears
                            sx: { minHeight: '3.4em' },
                        },
                    }}
                    size="small"
                    sx={{
                        '.MuiInputBase-root': {
                            borderRadius: 3,
                        },
                    }}
                    variant={textFieldVariant}
                />
            )}
            renderOption={({ key, ...props }, option, state) => {
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
                    <Box component="li" {...props} key={key}>
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
