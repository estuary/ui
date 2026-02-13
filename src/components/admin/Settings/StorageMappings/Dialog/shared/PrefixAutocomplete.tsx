import { useMemo, useRef, useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { ArrowRightTag } from 'iconoir-react';
import { gql, useQuery } from 'urql';

import { AnimatedHelperText } from 'src/components/shared/AnimatedHelperText';

interface BasePrefixesQueryResponse {
    prefixes: {
        edges: {
            cursor: string;
            node: {
                prefix: string;
            };
        }[];
    };
}

interface LiveSpecsQueryResponse {
    liveSpecs: {
        edges: {
            cursor: string;
            node: {
                catalogName: string;
                liveSpec: {
                    catalogType: string;
                };
            };
        }[];
    };
}

const BasePrefixesQuery = gql<BasePrefixesQueryResponse>`
    query BasePrefixesQuery {
        prefixes(by: { minCapability: admin }, first: 20) {
            edges {
                node {
                    prefix
                }
            }
        }
    }
`;

const LiveSpecsQuery = gql<
    LiveSpecsQueryResponse,
    {
        prefix: string;
    }
>`
    query LiveSpecsQuery($prefix: String!) {
        liveSpecs(by: { prefix: $prefix }, first: 100) {
            edges {
                cursor
                node {
                    catalogName
                    liveSpec {
                        catalogType
                    }
                }
            }
        }
    }
`;
export function useBasePrefixes() {
    const [{ data: prefixData }] = useQuery({
        query: BasePrefixesQuery,
    });

    const basePrefixes = useMemo(() => {
        return prefixData?.prefixes.edges.map((edge) => edge.node.prefix) ?? [];
    }, [prefixData]);

    return basePrefixes;
}

export function useLiveSpecs() {
    const basePrefixes = useBasePrefixes();

    const [{ data: liveSpecData }] = useQuery({
        query: LiveSpecsQuery,
        variables: { prefix: basePrefixes[0] },
        pause: basePrefixes.length === 0,
    });

    return useMemo(() => {
        return (
            liveSpecData?.liveSpecs.edges.map(
                (edge) => edge.node.catalogName
            ) ?? []
        );
    }, [liveSpecData]);
}

// ── Root prefix validation ──────────────────────────────────────────

export function validatePrefix(roots: string[]) {
    return (value: string): string | undefined => {
        if (!value || roots.length === 0) return undefined;

        const valid = roots.some((prefix) => value.startsWith(prefix));
        return valid
            ? undefined
            : `Must start with one of: ${roots.join(', ')}`;
    };
}

function isChildOfRoot(value: string, roots: string[]) {
    if (!value || roots.length === 0) return undefined;

    const matchesRoot = roots.some(
        (prefix) => prefix.startsWith(value) || value.startsWith(prefix)
    );

    return matchesRoot
        ? undefined
        : `Must start with one of: ${roots.join(', ')}`;
}

// ── PrefixAutocomplete (standalone controlled component) ────────────

interface PrefixAutocompleteProps {
    roots: string[];
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
    roots,
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
    const [hasBlurred, setHasBlurred] = useState(false);

    const rootError = useMemo(() => {
        const typingError = isChildOfRoot(value, roots);
        if (typingError) return typingError;

        if (hasBlurred) {
            return validatePrefix(roots)(value);
        }

        return undefined;
    }, [value, roots, hasBlurred]);

    const hasError = error || !!rootError;
    const displayMessage = rootError ?? errorMessage ?? helperText;

    const branches = useMemo(() => {
        const allBranches = new Set<string>();

        for (const leaf of [...roots, ...leaves]) {
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
    }, [roots, leaves]);

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
                <li {...props}>
                    {index === 0 ? (
                        <span
                            style={{
                                marginRight: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            <ArrowRightTag fontSize={12} />
                        </span>
                    ) : (
                        <span style={{ marginLeft: 22 }} />
                    )}
                    {option}
                </li>
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
                if (!hasBlurred) {
                    setHasBlurred(true);
                }
                onBlur?.();
            }}
            renderInput={(params) => (
                <>
                    <TextField
                        {...params}
                        label={label}
                        required={required}
                        error={hasError}
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
                        error={hasError}
                        message={displayMessage}
                    />
                </>
            )}
        />
    );
}
